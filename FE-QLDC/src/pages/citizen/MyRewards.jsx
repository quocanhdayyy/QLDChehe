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
  Statistic,
  Row,
  Col,
  Spin,
  message,
  Image,
} from "antd";
import {
  GiftOutlined,
  TrophyOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { rewardService } from "../../services/rewardService";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MyRewards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchMyProposals();
  }, []);

  const fetchMyProposals = async () => {
    try {
      setLoading(true);
      const response = await rewardService.proposals.getMyProposals();
      const data = response.docs || response || [];
      setProposals(data);
    } catch (error) {
      console.error("Error fetching my proposals:", error);
      message.error("Không thể tải danh sách đề xuất");
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

  const columns = [
    {
      title: "Mã đề xuất",
      dataIndex: "_id",
      key: "_id",
      width: 120,
      render: (text) => (
        <Text strong style={{ fontSize: 12 }}>
          {text?.slice(0, 8)}...
        </Text>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Người được đề xuất",
      dataIndex: ["citizen", "fullName"],
      key: "citizen",
      render: (text) => text || "N/A",
    },
    {
      title: "Tiêu chí",
      dataIndex: "criteria",
      key: "criteria",
      render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Tag color={config.color} icon={config.icon}>
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
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const handleView = (record) => {
    setCurrentReward(record);
    setViewModalVisible(true);
  };

  // Calculate statistics
  const pendingCount = proposals.filter((p) => p.status === "PENDING").length;
  const approvedCount = proposals.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = proposals.filter((p) => p.status === "REJECTED").length;

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải danh sách đề xuất..." />
        </div>
      </Layout>
    );
  }

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
              <TrophyOutlined /> Đề Xuất Khen Thưởng Của Tôi
            </Title>
            <Text type="secondary">
              Danh sách các đề xuất khen thưởng đã gửi
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate("/citizen/submit-reward-proposal")}
          >
            Đề xuất khen thưởng
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Card bordered={false}>
              <Statistic
                title="Tổng đề xuất"
                value={proposals.length}
                prefix={<TrophyOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false}>
              <Statistic
                title="Chờ duyệt"
                value={pendingCount}
                prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false}>
              <Statistic
                title="Đã duyệt"
                value={approvedCount}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false}>
              <Statistic
                title="Từ chối"
                value={rejectedCount}
                prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card bordered={false}>
          {proposals.length === 0 ? (
            <Empty
              description="Bạn chưa có đề xuất nào"
              style={{ padding: "60px 0" }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/citizen/submit-reward-proposal")}
              >
                Đề xuất khen thưởng
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={proposals}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} đề xuất`,
              }}
              scroll={{ x: 1200 }}
            />
          )}
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
          {currentReward && (
            <>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã đề xuất" span={2}>
                  <Text strong style={{ fontSize: 12 }}>
                    {currentReward._id}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề" span={2}>
                  <Text strong>{currentReward.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người được đề xuất" span={2}>
                  {currentReward.citizen?.fullName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {currentReward.description}
                </Descriptions.Item>
                {currentReward.criteria && (
                  <Descriptions.Item label="Tiêu chí" span={2}>
                    {currentReward.criteria}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Ngày gửi">
                  {dayjs(currentReward.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {statusConfig[currentReward.status] && (
                    <Tag
                      color={statusConfig[currentReward.status].color}
                      icon={statusConfig[currentReward.status].icon}
                    >
                      {statusConfig[currentReward.status].text}
                    </Tag>
                  )}
                </Descriptions.Item>
                {currentReward.reviewedAt && (
                  <>
                    <Descriptions.Item label="Ngày duyệt">
                      {dayjs(currentReward.reviewedAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người duyệt">
                      {currentReward.reviewedBy?.fullName || "N/A"}
                    </Descriptions.Item>
                    {currentReward.rejectionReason && (
                      <Descriptions.Item label="Lý do từ chối" span={2}>
                        <Text type="danger">
                          {currentReward.rejectionReason}
                        </Text>
                      </Descriptions.Item>
                    )}
                  </>
                )}
              </Descriptions>

              {/* Evidence Images */}
              {currentReward.evidenceImages &&
                currentReward.evidenceImages.length > 0 && (
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
                        {currentReward.evidenceImages.map((img, idx) => (
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
      </div>
    </Layout>
  );
};

export default MyRewards;
