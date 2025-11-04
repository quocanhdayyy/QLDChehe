import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  Empty,
  Modal,
  Descriptions,
  Spin,
  Alert,
  message,
  Image,
  Tabs,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  TrophyOutlined,
  EditOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import { editRequestService } from "../../services";
import { rewardService } from "../../services/rewardService";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MyRequests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [editRequests, setEditRequests] = useState([]);
  const [rewardProposals, setRewardProposals] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Reload khi có navigation state từ SubmitEditRequest hoặc SubmitRewardProposal
  useEffect(() => {
    if (location.state?.refresh) {
      console.log("🔄 Refreshing requests list...");
      fetchAllRequests();
      // Clear state để tránh reload liên tục
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);

      // Fetch cả 2 loại requests song song
      const [editResponse, rewardResponse] = await Promise.all([
        editRequestService.getMyRequests().catch(() => ({ docs: [] })),
        rewardService.proposals.getMyProposals().catch(() => ({ docs: [] })),
      ]);

      const editData = editResponse.docs || editResponse || [];
      const rewardData = rewardResponse.docs || rewardResponse || [];

      // Thêm type để phân biệt
      const formattedEditRequests = editData.map((item) => ({
        ...item,
        requestCategory: "EDIT",
      }));

      const formattedRewardProposals = rewardData.map((item) => ({
        ...item,
        requestCategory: "REWARD",
      }));

      setEditRequests(formattedEditRequests);
      setRewardProposals(formattedRewardProposals);

      // Merge và sort theo ngày tạo
      const merged = [
        ...formattedEditRequests,
        ...formattedRewardProposals,
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllRequests(merged);
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    PENDING: {
      color: "gold",
      text: "Chờ duyệt",
      icon: <ClockCircleOutlined />,
    },
    APPROVED: {
      color: "green",
      text: "Đã duyệt",
      icon: <CheckCircleOutlined />,
    },
    REJECTED: {
      color: "red",
      text: "Từ chối",
      icon: <CloseCircleOutlined />,
    },
  };

  const handleView = (record) => {
    setCurrentRequest(record);
    setViewModalVisible(true);
  };

  const handleCancelRequest = (record) => {
    setRequestToCancel(record);
    setCancelModalVisible(true);
  };

  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;

    try {
      setCancelling(true);

      // Gọi API để hủy yêu cầu
      if (requestToCancel.requestCategory === "EDIT") {
        await editRequestService.cancelRequest(requestToCancel._id);
      } else if (requestToCancel.requestCategory === "REWARD") {
        await rewardService.proposals.cancel(requestToCancel._id);
      }

      message.success("Đã xóa yêu cầu thành công");

      // Refresh danh sách
      await fetchAllRequests();

      // Đóng modal
      setCancelModalVisible(false);
      setRequestToCancel(null);
    } catch (error) {
      console.error("Error cancelling request:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể xóa yêu cầu. Vui lòng thử lại."
      );
    } finally {
      setCancelling(false);
    }
  };

  const requestCategoryConfig = {
    EDIT: {
      color: "blue",
      text: "Chỉnh sửa",
      icon: <EditOutlined />,
    },
    REWARD: {
      color: "gold",
      text: "Khen thưởng",
      icon: <TrophyOutlined />,
    },
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text strong style={{ color: "#1890ff" }}>
          #{index + 1}
        </Text>
      ),
    },
    {
      title: "Loại",
      dataIndex: "requestCategory",
      key: "requestCategory",
      width: 120,
      render: (category) => {
        const config = requestCategoryConfig[category];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Chỉnh sửa", value: "EDIT" },
        { text: "Khen thưởng", value: "REWARD" },
      ],
      onFilter: (value, record) => record.requestCategory === value,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        const displayTitle =
          record.proposedChanges?.title || record.title || "N/A";
        return (
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "350px",
            }}
          >
            {displayTitle}
          </div>
        );
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 115,
      render: (date) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 115,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: "PENDING" },
        { text: "Đã duyệt", value: "APPROVED" },
        { text: "Từ chối", value: "REJECTED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          {record.status === "PENDING" && (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleCancelRequest(record)}
              title="Xóa yêu cầu này"
            >
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải danh sách yêu cầu..." />
        </div>
      </Layout>
    );
  }

  // Get filtered data based on active tab
  const getFilteredRequests = () => {
    switch (activeTab) {
      case "edit":
        return editRequests;
      case "reward":
        return rewardProposals;
      default:
        return allRequests;
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              <FileTextOutlined /> Yêu Cầu Của Tôi
            </Title>
            <Text type="secondary">
              Quản lý tất cả yêu cầu chỉnh sửa và đề xuất khen thưởng
            </Text>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate("/citizen/submit-edit-request")}
            >
              Yêu cầu chỉnh sửa
            </Button>
            <Button
              type="primary"
              icon={<TrophyOutlined />}
              onClick={() => navigate("/citizen/submit-reward-proposal")}
            >
              Đề xuất khen thưởng
            </Button>
          </Space>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Card hoverable style={{ background: "#f0f5ff" }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                <FileTextOutlined /> Tổng số yêu cầu
              </Text>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                {allRequests.length}
              </Title>
            </Space>
          </Card>
          <Card hoverable style={{ background: "#fffbe6" }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                <ClockCircleOutlined /> Chờ duyệt
              </Text>
              <Title level={2} style={{ margin: 0, color: "#faad14" }}>
                {allRequests.filter((r) => r.status === "PENDING").length}
              </Title>
            </Space>
          </Card>
          <Card hoverable style={{ background: "#f6ffed" }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                <CheckCircleOutlined /> Đã duyệt
              </Text>
              <Title level={2} style={{ margin: 0, color: "#52c41a" }}>
                {allRequests.filter((r) => r.status === "APPROVED").length}
              </Title>
            </Space>
          </Card>
          <Card hoverable style={{ background: "#fff1f0" }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                <CloseCircleOutlined /> Từ chối
              </Text>
              <Title level={2} style={{ margin: 0, color: "#ff4d4f" }}>
                {allRequests.filter((r) => r.status === "REJECTED").length}
              </Title>
            </Space>
          </Card>
        </div>

        {/* Tabs and Table */}
        <Card bordered={false}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "all",
                label: (
                  <span>
                    <FileTextOutlined /> Tất cả ({allRequests.length})
                  </span>
                ),
              },
              {
                key: "edit",
                label: (
                  <span>
                    <EditOutlined /> Chỉnh sửa ({editRequests.length})
                  </span>
                ),
              },
              {
                key: "reward",
                label: (
                  <span>
                    <TrophyOutlined /> Khen thưởng ({rewardProposals.length})
                  </span>
                ),
              },
            ]}
          />
          {filteredRequests.length === 0 ? (
            <Empty
              description="Chưa có yêu cầu nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: "60px 0" }}
            >
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate("/citizen/submit-edit-request")}
                >
                  Gửi yêu cầu chỉnh sửa
                </Button>
                <Button
                  type="primary"
                  icon={<TrophyOutlined />}
                  onClick={() => navigate("/citizen/submit-reward-proposal")}
                >
                  Đề xuất khen thưởng
                </Button>
              </Space>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredRequests}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} yêu cầu`,
              }}
            />
          )}
        </Card>

        {/* View Detail Modal */}
        <Modal
          title={
            <Space>
              {currentRequest?.requestCategory === "REWARD" ? (
                <TrophyOutlined />
              ) : (
                <FileTextOutlined />
              )}
              <span>
                Chi Tiết{" "}
                {currentRequest?.requestCategory === "REWARD"
                  ? "Đề Xuất Khen Thưởng"
                  : "Yêu Cầu Chỉnh Sửa"}
              </span>
            </Space>
          }
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
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Descriptions
                bordered
                column={1}
                labelStyle={{
                  fontWeight: 600,
                  width: "25%",
                  backgroundColor: "#fafafa",
                }}
              >
                <Descriptions.Item label="Loại">
                  {requestCategoryConfig[currentRequest.requestCategory] && (
                    <Tag
                      color={
                        requestCategoryConfig[currentRequest.requestCategory]
                          .color
                      }
                      icon={
                        requestCategoryConfig[currentRequest.requestCategory]
                          .icon
                      }
                    >
                      {
                        requestCategoryConfig[currentRequest.requestCategory]
                          .text
                      }
                    </Tag>
                  )}
                </Descriptions.Item>

                {/* Edit request type */}
                {currentRequest.requestCategory === "EDIT" &&
                  currentRequest.requestType && (
                    <Descriptions.Item label="Phân loại">
                      <Tag color="blue">
                        {currentRequest.requestType === "UPDATE_INFO" ||
                        currentRequest.requestType === "EDIT_INFO"
                          ? "Chỉnh sửa thông tin"
                          : currentRequest.requestType === "ADD_MEMBER"
                          ? "Thêm nhân khẩu"
                          : currentRequest.requestType === "REMOVE_MEMBER"
                          ? "Xóa nhân khẩu"
                          : currentRequest.requestType === "TEMP_ABSENCE"
                          ? "Tạm vắng"
                          : currentRequest.requestType === "TEMP_RESIDENCE"
                          ? "Tạm trú"
                          : currentRequest.requestType === "MOVE_OUT"
                          ? "Chuyển đi"
                          : currentRequest.requestType === "MOVE_IN"
                          ? "Chuyển đến"
                          : currentRequest.requestType}
                      </Tag>
                    </Descriptions.Item>
                  )}

                {/* Reward specific */}
                {currentRequest.requestCategory === "REWARD" && (
                  <>
                    <Descriptions.Item label="Người được đề xuất">
                      <Text strong>
                        {currentRequest.citizen?.fullName || "N/A"}
                      </Text>
                    </Descriptions.Item>
                    {currentRequest.criteria && (
                      <Descriptions.Item label="Tiêu chí">
                        {currentRequest.criteria}
                      </Descriptions.Item>
                    )}
                  </>
                )}

                <Descriptions.Item label="Tiêu đề">
                  <Text strong>
                    {currentRequest.proposedChanges?.title ||
                      currentRequest.title ||
                      "N/A"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả chi tiết">
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {currentRequest.proposedChanges?.description ||
                      currentRequest.description ||
                      "Không có mô tả"}
                  </div>
                </Descriptions.Item>

                {/* Chi tiết cụ thể từ proposedChanges */}
                {currentRequest.requestCategory === "EDIT" &&
                  currentRequest.proposedChanges?.details && (
                    <Descriptions.Item label="Thông tin bổ sung">
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          backgroundColor: "#f0f2f5",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      >
                        {currentRequest.proposedChanges.details}
                      </div>
                    </Descriptions.Item>
                  )}

                <Descriptions.Item label="Ngày gửi">
                  {dayjs(currentRequest.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {(() => {
                    const config =
                      statusConfig[currentRequest.status] ||
                      statusConfig.PENDING;
                    return (
                      <Tag
                        icon={config.icon}
                        color={config.color}
                        style={{ fontSize: "13px" }}
                      >
                        {config.text}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>

                {currentRequest.reviewedAt && (
                  <>
                    <Descriptions.Item label="Ngày duyệt">
                      {dayjs(currentRequest.reviewedAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người duyệt">
                      {currentRequest.reviewedBy?.fullName || "N/A"}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>

              {/* Lý do từ chối */}
              {currentRequest.rejectionReason && (
                <Alert
                  message="Lý do từ chối"
                  description={currentRequest.rejectionReason}
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}

              {/* Hình ảnh minh chứng */}
              {currentRequest.requestCategory === "REWARD" &&
                currentRequest.evidenceImages &&
                currentRequest.evidenceImages.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong style={{ marginBottom: 8, display: "block" }}>
                      Hình ảnh minh chứng:
                    </Text>
                    <Image.PreviewGroup>
                      <Space wrap>
                        {currentRequest.evidenceImages.map((img, idx) => (
                          <Image
                            key={idx}
                            src={img}
                            width={100}
                            height={100}
                            style={{ objectFit: "cover", borderRadius: 4 }}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </div>
                )}
            </div>
          )}
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
              <span>Xác nhận xóa yêu cầu</span>
            </Space>
          }
          open={cancelModalVisible}
          onCancel={() => {
            setCancelModalVisible(false);
            setRequestToCancel(null);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setCancelModalVisible(false);
                setRequestToCancel(null);
              }}
              disabled={cancelling}
            >
              Không
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={cancelling}
              onClick={confirmCancelRequest}
              icon={<StopOutlined />}
            >
              Xác nhận xóa
            </Button>,
          ]}
          width={500}
        >
          {requestToCancel && (
            <div>
              <Alert
                message="Cảnh báo"
                description="Bạn có chắc chắn muốn xóa yêu cầu này? Yêu cầu sẽ bị xóa vĩnh viễn và không thể khôi phục."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Loại">
                  {requestCategoryConfig[requestToCancel.requestCategory]?.text}
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề">
                  <Text strong>
                    {requestToCancel.proposedChanges?.title ||
                      requestToCancel.title ||
                      "N/A"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày gửi">
                  {dayjs(requestToCancel.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default MyRequests;
