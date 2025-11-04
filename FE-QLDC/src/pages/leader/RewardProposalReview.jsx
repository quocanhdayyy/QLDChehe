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
  Image,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import dayjs from "dayjs";
import { rewardService } from "../../services/rewardService";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RewardProposalReview = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Fetch proposals from API
  useEffect(() => {
    fetchProposals();
    fetchStats();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await rewardService.proposals.getAll();
      const formattedProposals = response.docs.map((doc) => ({
        key: doc._id,
        id: doc._id,
        _id: doc._id,
        citizen: doc.citizen?.fullName || "N/A",
        citizenId: doc.citizen?._id,
        proposedBy: doc.proposedBy?.fullName || "N/A",
        proposedById: doc.proposedBy?._id,
        title: doc.title,
        description: doc.description,
        criteria: doc.criteria,
        evidenceImages: doc.evidenceImages || [],
        submitDate: doc.createdAt,
        status: doc.status?.toLowerCase() || "pending",
        reviewDate: doc.reviewedAt,
        reviewer: doc.reviewedBy?.fullName || null,
        reviewNote: doc.rejectionReason || "",
        approvedAt: doc.approvedAt,
      }));
      setProposals(formattedProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      message.error("Không thể tải danh sách đề xuất");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await rewardService.proposals.getStats();
      setStats({
        total: statsData.total,
        pending: statsData.pending,
        approved: statsData.approved,
        rejected: statsData.rejected,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

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
      title: "Người được đề xuất",
      dataIndex: "citizen",
      key: "citizen",
    },
    {
      title: "Người đề xuất",
      dataIndex: "proposedBy",
      key: "proposedBy",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text) => <Text>{text}</Text>,
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
      width: 250,
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
    setCurrentProposal(record);
    setViewModalVisible(true);
  };

  const handleReview = (record, action) => {
    setCurrentProposal({ ...record, reviewAction: action });
    setReviewNote("");
    setReviewModalVisible(true);
  };

  const handleReviewConfirm = async () => {
    if (!currentProposal) return;

    setLoading(true);
    try {
      if (currentProposal.reviewAction === "approved") {
        await rewardService.proposals.approve(currentProposal._id, {
          note: reviewNote,
        });
        message.success("Đã duyệt đề xuất khen thưởng thành công");
      } else {
        await rewardService.proposals.reject(currentProposal._id, {
          reason: reviewNote || "Không có lý do",
        });
        message.success("Đã từ chối đề xuất");
      }

      // Refresh data
      await fetchProposals();
      await fetchStats();

      setReviewModalVisible(false);
      setCurrentProposal(null);
      setReviewNote("");
    } catch (error) {
      console.error("Error reviewing proposal:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi xử lý đề xuất. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter((prop) => {
    const matchSearch = Object.values(prop).some((value) =>
      value?.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const matchStatus =
      selectedStatus === "all" || prop.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <TrophyOutlined /> Duyệt Đề Xuất Khen Thưởng
          </Title>
        </div>

        {/* Statistics */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space size="large">
            <div>
              <Text type="secondary">Tổng đề xuất</Text>
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
                placeholder="Tìm kiếm đề xuất..."
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
            dataSource={filteredProposals}
            loading={loading}
            pagination={{
              total: filteredProposals.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đề xuất`,
            }}
          />
        </Card>

        {/* View Modal */}
        <Modal
          title="Chi tiết đề xuất khen thưởng"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {currentProposal && (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Người được đề xuất">
                  {currentProposal.citizen}
                </Descriptions.Item>
                <Descriptions.Item label="Người đề xuất">
                  {currentProposal.proposedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề" span={2}>
                  <Text strong>{currentProposal.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {currentProposal.description}
                </Descriptions.Item>
                {currentProposal.criteria && (
                  <Descriptions.Item label="Tiêu chí" span={2}>
                    {currentProposal.criteria}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Ngày gửi">
                  {dayjs(currentProposal.submitDate).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {statusConfig[currentProposal.status] && (
                    <Tag
                      color={statusConfig[currentProposal.status].color}
                      icon={statusConfig[currentProposal.status].icon}
                    >
                      {statusConfig[currentProposal.status].text}
                    </Tag>
                  )}
                </Descriptions.Item>
                {currentProposal.reviewDate && (
                  <>
                    <Descriptions.Item label="Ngày duyệt">
                      {dayjs(currentProposal.reviewDate).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người duyệt">
                      {currentProposal.reviewer || "N/A"}
                    </Descriptions.Item>
                    {currentProposal.reviewNote && (
                      <Descriptions.Item label="Ghi chú" span={2}>
                        {currentProposal.reviewNote}
                      </Descriptions.Item>
                    )}
                  </>
                )}
              </Descriptions>

              {/* Evidence Images */}
              {currentProposal.evidenceImages &&
                currentProposal.evidenceImages.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Hình ảnh minh chứng:</Text>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      <Image.PreviewGroup>
                        {currentProposal.evidenceImages.map((img, idx) => (
                          <Image
                            key={idx}
                            src={img}
                            width={100}
                            height={100}
                            style={{ objectFit: "cover", borderRadius: 4 }}
                          />
                        ))}
                      </Image.PreviewGroup>
                    </div>
                  </div>
                )}
            </>
          )}
        </Modal>

        {/* Review Modal */}
        <Modal
          title={
            currentProposal?.reviewAction === "approved"
              ? "Duyệt đề xuất khen thưởng"
              : "Từ chối đề xuất"
          }
          open={reviewModalVisible}
          onOk={handleReviewConfirm}
          onCancel={() => setReviewModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={loading}
        >
          {currentProposal && (
            <>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Người được đề xuất">
                  {currentProposal.citizen}
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề">
                  {currentProposal.title}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {currentProposal.description}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 16 }}>
                <Text strong>
                  Ghi chú{" "}
                  {currentProposal.reviewAction === "approved"
                    ? "duyệt"
                    : "từ chối"}
                  :
                </Text>
                <TextArea
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    currentProposal.reviewAction === "approved"
                      ? "Nhập ghi chú (không bắt buộc)"
                      : "Nhập lý do từ chối (không bắt buộc)"
                  }
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

export default RewardProposalReview;
