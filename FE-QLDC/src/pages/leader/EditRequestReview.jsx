import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Modal,
  message,
  Descriptions,
  Select,
  Spin,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import { editRequestService } from "../../services/editRequestService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditRequestReview = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [requests, setRequests] = useState([]);

  // Fetch requests from backend
  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching edit requests...");

      const response = await editRequestService.getAll();
      console.log("📋 Requests response:", response);

      // Backend trả về { docs, total, page, limit }
      const requestList = response.docs || [];

      // Transform data to match table format
      const transformedRequests = requestList.map((req) => ({
        key: req._id,
        _id: req._id,
        id: req._id.slice(-8).toUpperCase(), // Mã ngắn gọn từ _id
        citizen: req.citizen?.fullName || req.requestedBy?.fullName || "N/A",
        citizenId: req.citizen?._id,
        household: req.citizen?.household?.code || "N/A",
        householdId: req.citizen?.household?._id,
        type: req.title || "Chỉnh sửa thông tin",
        description: req.reason || req.description || "N/A",
        proposedChanges: req.proposedChanges,
        submitDate: req.createdAt,
        status: req.status.toLowerCase(), // PENDING -> pending
        reviewDate: req.reviewedAt,
        reviewer: req.reviewedBy?.fullName || req.reviewedBy?.username,
        reviewNote: req.rejectionReason || "N/A",
      }));

      setRequests(transformedRequests);
      console.log(`✅ Loaded ${transformedRequests.length} requests`);
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
      message.error("Không thể tải danh sách yêu cầu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusConfig = {
    pending: {
      color: "gold",
      text: "Chờ duyệt",
      icon: <ClockCircleOutlined />,
    },
    approved: {
      color: "green",
      text: "Đã duyệt",
      icon: <CheckCircleOutlined />,
    },
    rejected: {
      color: "red",
      text: "Từ chối",
      icon: <CloseCircleOutlined />,
    },
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <Text strong style={{ color: "#1890ff" }}>
          #{index + 1}
        </Text>
      ),
    },
    {
      title: "Công dân",
      dataIndex: "citizen",
      key: "citizen",
    },
    {
      title: "Hộ khẩu",
      dataIndex: "household",
      key: "household",
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Ngày gửi",
      dataIndex: "submitDate",
      key: "submitDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleReview(record, "approved")}
                style={{ color: "#52c41a" }}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReview(record, "rejected")}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    setCurrentRequest(record);
    setViewModalVisible(true);
  };

  const handleReview = (record, action) => {
    setCurrentRequest({ ...record, reviewAction: action });
    setReviewNote("");
    setReviewModalVisible(true);
  };

  const handleReviewConfirm = async () => {
    try {
      setLoading(true);
      console.log(
        `🔄 ${
          currentRequest.reviewAction === "approved" ? "Approving" : "Rejecting"
        } request:`,
        currentRequest._id
      );

      if (currentRequest.reviewAction === "approved") {
        // Gọi API approve
        await editRequestService.approve(currentRequest._id, {
          note: reviewNote || "Đã duyệt",
        });
        message.success("✅ Đã duyệt yêu cầu thành công");
      } else {
        // Gọi API reject
        await editRequestService.reject(currentRequest._id, {
          reason: reviewNote || "Từ chối yêu cầu",
        });
        message.success("✅ Đã từ chối yêu cầu");
      }

      // Reload danh sách
      await fetchRequests();

      setReviewModalVisible(false);
      setCurrentRequest(null);
      setReviewNote("");
    } catch (error) {
      console.error("❌ Error reviewing request:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể xử lý yêu cầu. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchSearch = Object.values(req).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const matchStatus =
      selectedStatus === "all" || req.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Duyệt Yêu Cầu Chỉnh Sửa
          </Title>
        </div>

        {/* Statistics */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space size="large">
            <div>
              <Text type="secondary">Tổng yêu cầu</Text>
              <Title level={3} style={{ margin: 0 }}>
                {stats.total}
              </Title>
            </div>
            <div>
              <Text type="secondary">Chờ duyệt</Text>
              <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                {stats.pending}
              </Title>
            </div>
            <div>
              <Text type="secondary">Đã duyệt</Text>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {stats.approved}
              </Title>
            </div>
            <div>
              <Text type="secondary">Từ chối</Text>
              <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                {stats.rejected}
              </Title>
            </div>
          </Space>
        </Card>

        {/* Filter Bar */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Space>
              <Input
                placeholder="Tìm kiếm yêu cầu..."
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                style={{ width: 150 }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">Tất cả</Option>
                <Option value="pending">Chờ duyệt</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Từ chối</Option>
              </Select>
            </Space>
          </Space>
        </Card>

        {/* Table */}
        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={filteredRequests}
            loading={loading}
            pagination={{
              total: filteredRequests.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
            }}
          />
        </Card>

        {/* View Modal */}
        <Modal
          title="Chi tiết yêu cầu"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {currentRequest && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Công dân">
                {currentRequest.citizen}
              </Descriptions.Item>
              <Descriptions.Item label="Hộ khẩu">
                {currentRequest.household}
              </Descriptions.Item>
              <Descriptions.Item label="Loại yêu cầu" span={2}>
                <Tag color="blue">{currentRequest.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do" span={2}>
                {currentRequest.description}
              </Descriptions.Item>
              {currentRequest.proposedChanges && (
                <Descriptions.Item label="Thông tin đề xuất thay đổi" span={2}>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: 12,
                      borderRadius: 4,
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(currentRequest.proposedChanges, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày gửi">
                {dayjs(currentRequest.submitDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {statusConfig[currentRequest.status] && (
                  <Tag
                    color={statusConfig[currentRequest.status].color}
                    icon={statusConfig[currentRequest.status].icon}
                  >
                    {statusConfig[currentRequest.status].text}
                  </Tag>
                )}
              </Descriptions.Item>
              {currentRequest.reviewDate && (
                <>
                  <Descriptions.Item label="Ngày duyệt">
                    {dayjs(currentRequest.reviewDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người duyệt">
                    {currentRequest.reviewer || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {currentRequest.reviewNote || "Không có"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Review Modal */}
        <Modal
          title={
            currentRequest?.reviewAction === "approved"
              ? "Duyệt yêu cầu"
              : "Từ chối yêu cầu"
          }
          open={reviewModalVisible}
          onOk={handleReviewConfirm}
          onCancel={() => setReviewModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          {currentRequest && (
            <>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Công dân">
                  {currentRequest.citizen}
                </Descriptions.Item>
                <Descriptions.Item label="Loại yêu cầu">
                  {currentRequest.type}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {currentRequest.description}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 16 }}>
                <Text strong>
                  Ghi chú{" "}
                  {currentRequest.reviewAction === "approved"
                    ? "duyệt"
                    : "từ chối"}
                  :
                </Text>
                <TextArea
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  style={{ marginTop: 8 }}
                />
              </div>
            </>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default EditRequestReview;
