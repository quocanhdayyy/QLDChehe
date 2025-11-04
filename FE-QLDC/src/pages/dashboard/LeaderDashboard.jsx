import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  Divider,
  message,
  Avatar,
  Descriptions,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Badge,
  List,
  Alert,
  Upload,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  GiftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  CrownOutlined,
  EditOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  BellOutlined,
  CameraOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import dayjs from "dayjs";
import {
  householdService,
  citizenService,
  editRequestService,
  rewardService,
  notificationService,
  uploadService,
} from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;

const LeaderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderInfo, setLeaderInfo] = useState(null);
  const [stats, setStats] = useState({
    households: { total: 0, increase: 0, percentage: 0 },
    citizens: { total: 0, increase: 0, percentage: 0 },
    pendingRequests: { total: 0, decrease: 0, percentage: 0 },
    rewards: { total: 0, increase: 0, percentage: 0 },
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch leader info
        try {
          const leaderResponse = await citizenService.getMe();
          console.log("👤 Fetched leader info:", leaderResponse);
          console.log("🖼️ Leader avatarUrl:", leaderResponse?.avatarUrl);
          setLeaderInfo(leaderResponse);
        } catch (err) {
          console.log("⚠️ Could not fetch leader info:", err.message);
        }

        // Fetch all stats in parallel
        const [
          householdStats,
          citizenStats,
          requestStats,
          rewardStats,
          requests,
        ] = await Promise.all([
          householdService.getStats().catch(() => ({ total: 0 })),
          citizenService.getStats().catch(() => ({ total: 0 })),
          editRequestService.getStats().catch(() => ({ pending: 0 })),
          rewardService.proposals.getStats().catch(() => ({ total: 0 })),
          editRequestService
            .getAll({ limit: 5, status: "pending" })
            .catch(() => []),
        ]);

        // Update stats
        setStats({
          households: {
            total: householdStats.total || 0,
            increase: householdStats.lastMonthIncrease || 0,
            percentage: householdStats.percentageChange || 0,
          },
          citizens: {
            total: citizenStats.total || 0,
            increase: citizenStats.lastMonthIncrease || 0,
            percentage: citizenStats.percentageChange || 0,
          },
          pendingRequests: {
            total: requestStats.pending || 0,
            decrease: requestStats.lastMonthChange || 0,
            percentage: requestStats.percentageChange || 0,
          },
          rewards: {
            total: rewardStats.total || 0,
            increase: rewardStats.thisMonthTotal || 0,
            percentage: rewardStats.percentageChange || 0,
          },
        });

        // Update recent requests
        // Handle response structure: { docs, total } or array
        const requestsData = requests.docs || requests || [];
        if (Array.isArray(requestsData)) {
          setRecentRequests(
            requestsData.slice(0, 5).map((req, index) => ({
              key: req._id || index,
              id: req.code || req._id,
              citizen: req.citizenId?.fullName || req.fullName || "N/A",
              type: req.requestType || "N/A",
              date: req.createdAt || new Date().toISOString(),
              status: req.status || "pending",
            }))
          );
        }

        // Fetch notifications (chỉ lấy yêu cầu mới, không lấy phản hồi)
        try {
          const notificationsResponse = await notificationService.getAll({
            limit: 50,
            sort: "-createdAt",
          });
          const allNotifs =
            notificationsResponse.docs || notificationsResponse || [];

          // Filter: CHỈ lấy thông báo "yêu cầu mới" (title có "Mới")
          // Loại bỏ thông báo phản hồi (title có "được duyệt" hoặc "bị từ chối")
          const newRequestNotifs = allNotifs.filter((n) => {
            const title = n.title || "";
            return title.includes("Mới"); // "Yêu Cầu Chỉnh Sửa Mới", "Đề Xuất Khen Thưởng Mới"
          });

          console.log(
            `📊 Total notifications: ${allNotifs.length}, New requests: ${newRequestNotifs.length}`
          );
          setNotifications(newRequestNotifs);
          const unread = newRequestNotifs.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        } catch (err) {
          console.log("⚠️ No notifications yet:", err.message);
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleEditProfile = () => {
    // Nếu đã có thông tin, điền vào form
    if (leaderInfo) {
      profileForm.setFieldsValue({
        fullName: leaderInfo.fullName,
        avatarUrl: leaderInfo.avatarUrl || "",
        email: leaderInfo.email || "",
        phone: leaderInfo.phone || "",
        nationalId: leaderInfo.nationalId || "",
        dateOfBirth: leaderInfo.dateOfBirth
          ? dayjs(leaderInfo.dateOfBirth)
          : null,
        gender: leaderInfo.gender,
        ethnicity: leaderInfo.ethnicity || "Kinh",
        nationality: leaderInfo.nationality || "Việt Nam",
        educationLevel: leaderInfo.educationLevel || "",
        occupation: leaderInfo.occupation || "",
      });
    } else {
      // Nếu chưa có thông tin, để form trống với giá trị mặc định
      profileForm.setFieldsValue({
        fullName: user?.fullName || "",
        avatarUrl: "",
        email: "",
        phone: "",
        nationalId: "",
        dateOfBirth: null,
        gender: undefined,
        ethnicity: "Kinh",
        nationality: "Việt Nam",
        educationLevel: "",
        occupation: "",
      });
    }
    setIsEditProfileModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    setUpdateLoading(true);
    try {
      const updateData = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.toISOString()
          : null,
      };
      const updatedLeader = await citizenService.updateMe(updateData);
      setLeaderInfo(updatedLeader);

      if (!leaderInfo) {
        message.success("Thông tin cá nhân đã được lưu thành công!");
      } else {
        message.success("Cập nhật thông tin thành công!");
      }

      setIsEditProfileModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng tải ảnh đại diện");
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj;
      console.log("📤 Uploading avatar file:", file.name);

      const response = await uploadService.uploadAvatar(file);
      console.log("📥 Upload response:", response);

      // Update leader info với avatar mới
      setLeaderInfo(response.citizen);
      message.success("Cập nhật ảnh đại diện thành công!");

      // Reset form
      setFileList([]);
      setIsAvatarModalVisible(false);
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi upload ảnh"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await uploadService.deleteAvatar();
      const updatedLeader = await citizenService.getMe();
      setLeaderInfo(updatedLeader);
      message.success("Đã xóa ảnh đại diện");
    } catch (error) {
      console.error("❌ Error deleting avatar:", error);
      message.error("Có lỗi xảy ra khi xóa ảnh");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      message.success("Đã đánh dấu đã đọc");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);
      if (unreadIds.length === 0) {
        message.info("Không có thông báo chưa đọc");
        return;
      }
      await notificationService.markAllAsRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      message.success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
      message.error("Không thể đánh dấu tất cả đã đọc");
    }
  };

  const requestColumns = [
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
      title: "Loại yêu cầu",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ngày gửi",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          pending: { color: "gold", text: "Chờ duyệt" },
          approved: { color: "green", text: "Đã duyệt" },
          rejected: { color: "red", text: "Từ chối" },
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/leader/edit-requests/${record.id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Dashboard Tổ Trưởng
          </Title>
          <Text type="secondary">Tổng quan hệ thống quản lý dân cư</Text>
        </div>

        {/* Welcome Card with Leader Info */}
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row align="middle" gutter={24}>
            <Col>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  size={80}
                  src={uploadService.getAvatarUrl(leaderInfo?.avatarUrl)}
                  icon={
                    !leaderInfo?.avatarUrl &&
                    (leaderInfo?.gender === "MALE" ? (
                      <ManOutlined />
                    ) : (
                      <WomanOutlined />
                    ))
                  }
                  style={{
                    backgroundColor: leaderInfo?.avatarUrl
                      ? "#fff"
                      : leaderInfo?.gender === "MALE"
                      ? "#1890ff"
                      : "#eb2f96",
                  }}
                  onError={(e) => {
                    console.error(
                      "❌ Avatar image failed to load:",
                      leaderInfo?.avatarUrl
                    );
                    console.log("📋 Full leaderInfo:", leaderInfo);
                    return true; // Fallback to icon
                  }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  onClick={() => {
                    setFileList([]);
                    setAvatarPreviewError(false);
                    setIsAvatarModalVisible(true);
                  }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
              </div>
            </Col>
            <Col flex="auto">
              <Space direction="vertical" size={4}>
                <Title level={3} style={{ color: "white", marginBottom: 0 }}>
                  Chào mừng,{" "}
                  {leaderInfo?.fullName || user?.fullName || user?.username}!
                </Title>
                <Space size="middle">
                  <Tag
                    color="gold"
                    icon={<CrownOutlined />}
                    style={{ fontSize: "14px" }}
                  >
                    Tổ trưởng
                  </Tag>
                  {leaderInfo?.citizenCode && (
                    <Tag
                      color="blue"
                      style={{ fontSize: "14px", color: "white" }}
                    >
                      {leaderInfo.citizenCode}
                    </Tag>
                  )}
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                {leaderInfo ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditProfileModalVisible(true)}
                  >
                    Điền thông tin cá nhân
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/* Leader Details */}
          {leaderInfo ? (
            <div style={{ marginTop: 24 }}>
              <Descriptions
                column={{ xs: 1, sm: 2, md: 4 }}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <Descriptions.Item
                  label={
                    <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                      <IdcardOutlined /> CCCD/CMND
                    </Text>
                  }
                >
                  <Text strong style={{ color: "white" }}>
                    {leaderInfo.nationalId || "Chưa có"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                      <CalendarOutlined /> Ngày sinh
                    </Text>
                  }
                >
                  <Text strong style={{ color: "white" }}>
                    {leaderInfo.dateOfBirth
                      ? dayjs(leaderInfo.dateOfBirth).format("DD/MM/YYYY")
                      : "Chưa có"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                      Giới tính
                    </Text>
                  }
                >
                  <Text strong style={{ color: "white" }}>
                    {leaderInfo.gender === "MALE"
                      ? "Nam"
                      : leaderInfo.gender === "FEMALE"
                      ? "Nữ"
                      : "Khác"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                      Nghề nghiệp
                    </Text>
                  }
                >
                  <Text strong style={{ color: "white" }}>
                    {leaderInfo.occupation || "Chưa có"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <IdcardOutlined
                  style={{ fontSize: 48, color: "white", marginBottom: 16 }}
                />
                <Text
                  strong
                  style={{ color: "white", fontSize: 16, display: "block" }}
                >
                  Vui lòng điền thông tin cá nhân của bạn
                </Text>
                <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                  Để sử dụng đầy đủ chức năng hệ thống
                </Text>
              </div>
            </div>
          )}
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} hoverable>
              <Statistic
                title="Tổng Hộ Khẩu"
                value={stats.households.total}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                suffix={
                  <Space size={4} style={{ fontSize: 14 }}>
                    <ArrowUpOutlined style={{ color: "#3f8600" }} />
                    <Text type="success">{stats.households.percentage}%</Text>
                  </Space>
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{stats.households.increase} so với tháng trước
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} hoverable>
              <Statistic
                title="Tổng Công Dân"
                value={stats.citizens.total}
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                suffix={
                  <Space size={4} style={{ fontSize: 14 }}>
                    <ArrowUpOutlined style={{ color: "#3f8600" }} />
                    <Text type="success">{stats.citizens.percentage}%</Text>
                  </Space>
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{stats.citizens.increase} so với tháng trước
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} hoverable>
              <Statistic
                title="Yêu Cầu Chờ Duyệt"
                value={stats.pendingRequests.total}
                prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
                suffix={
                  <Space size={4} style={{ fontSize: 14 }}>
                    <ArrowDownOutlined style={{ color: "#cf1322" }} />
                    <Text type="danger">
                      {Math.abs(stats.pendingRequests.percentage)}%
                    </Text>
                  </Space>
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.pendingRequests.decrease} so với tháng trước
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} hoverable>
              <Statistic
                title="Khen Thưởng Tháng Này"
                value={stats.rewards.total}
                prefix={<GiftOutlined style={{ color: "#eb2f96" }} />}
                suffix={
                  <Space size={4} style={{ fontSize: 14 }}>
                    <ArrowUpOutlined style={{ color: "#3f8600" }} />
                    <Text type="success">{stats.rewards.percentage}%</Text>
                  </Space>
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{stats.rewards.increase} so với tháng trước
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Notifications Card */}
        <Card
          title={
            <Space>
              <span>Thông báo yêu cầu mới</span>
            </Space>
          }
          extra={
            unreadCount > 0 && (
              <Button type="link" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )
          }
          bordered={false}
          style={{ marginBottom: 24 }}
        >
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <BellOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
              <div style={{ marginTop: 16, color: "#999" }}>
                Chưa có yêu cầu mới nào
              </div>
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={notifications.slice(0, 5)}
              renderItem={(item) => (
                <List.Item
                  style={{
                    backgroundColor: item.isRead ? "transparent" : "#e6f7ff",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    cursor: item.isRead ? "default" : "pointer",
                  }}
                  onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                  actions={
                    !item.isRead
                      ? [
                          <Button
                            key="mark-read"
                            type="link"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(item._id);
                            }}
                          >
                            Đánh dấu đã đọc
                          </Button>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!item.isRead}>
                        <Avatar
                          icon={<BellOutlined />}
                          style={{
                            backgroundColor: item.isRead
                              ? "#d9d9d9"
                              : "#1890ff",
                          }}
                        />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong={!item.isRead}>{item.title}</Text>
                        {!item.isRead && <Tag color="blue">Mới</Tag>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{item.message}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
          {notifications.length > 5 && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button
                type="link"
                onClick={() => setIsNotificationModalVisible(true)}
              >
                Xem tất cả {notifications.length} thông báo
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Divider />
        <Card title="Thao tác nhanh" bordered={false} style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                icon={<TeamOutlined />}
                size="large"
                block
                onClick={() => navigate("/leader/households")}
              >
                Quản lý Hộ khẩu
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                icon={<UserOutlined />}
                size="large"
                block
                onClick={() => navigate("/leader/citizens")}
              >
                Quản lý Công dân
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                icon={<FileTextOutlined />}
                size="large"
                block
                onClick={() => navigate("/leader/edit-requests")}
              >
                Duyệt Yêu cầu
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button
                type="default"
                icon={<GiftOutlined />}
                size="large"
                block
                onClick={() => navigate("/leader/reward-proposals")}
              >
                Duyệt Khen thưởng
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Edit Profile Modal */}
        <Modal
          title={
            <Space>
              <EditOutlined />
              <span>
                {leaderInfo
                  ? "Chỉnh sửa thông tin cá nhân"
                  : "Điền thông tin cá nhân"}
              </span>
            </Space>
          }
          open={isEditProfileModalVisible}
          onCancel={() => setIsEditProfileModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    size="large"
                    placeholder="Họ và tên đầy đủ"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: "email", message: "Email không hợp lệ" }]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    size="large"
                    placeholder="Email"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="avatarUrl"
                  label="URL ảnh đại diện"
                  rules={[
                    {
                      type: "url",
                      message:
                        "Vui lòng nhập URL hợp lệ (bắt đầu với http:// hoặc https://)",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    size="large"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Số điện thoại không hợp lệ (10 số)",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    size="large"
                    placeholder="Số điện thoại"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nationalId"
                  label="CCCD/CMND"
                  rules={[
                    {
                      pattern: /^[0-9]{9,12}$/,
                      message: "CCCD/CMND không hợp lệ (9-12 số)",
                    },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    size="large"
                    placeholder="Số CCCD/CMND"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính" },
                  ]}
                >
                  <Select size="large" placeholder="Chọn giới tính">
                    <Option value="MALE">Nam</Option>
                    <Option value="FEMALE">Nữ</Option>
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="ethnicity" label="Dân tộc">
                  <Input size="large" placeholder="Dân tộc" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="nationality" label="Quốc tịch">
                  <Input size="large" placeholder="Quốc tịch" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="educationLevel" label="Trình độ học vấn">
                  <Select size="large" placeholder="Chọn trình độ">
                    <Option value="Tiểu học">Tiểu học</Option>
                    <Option value="THCS">THCS</Option>
                    <Option value="THPT">THPT</Option>
                    <Option value="Trung cấp">Trung cấp</Option>
                    <Option value="Cao đẳng">Cao đẳng</Option>
                    <Option value="Đại học">Đại học</Option>
                    <Option value="Thạc sĩ">Thạc sĩ</Option>
                    <Option value="Tiến sĩ">Tiến sĩ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="occupation" label="Nghề nghiệp">
                  <Input size="large" placeholder="Nghề nghiệp" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={updateLoading}
                >
                  {leaderInfo ? "Lưu thay đổi" : "Lưu thông tin"}
                </Button>
                <Button
                  size="large"
                  onClick={() => setIsEditProfileModalVisible(false)}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Notifications Modal */}
        <Modal
          title={
            <Space>
              <Badge count={unreadCount} offset={[10, 0]}>
                <BellOutlined />
              </Badge>
              <span>Thông báo</span>
            </Space>
          }
          open={isNotificationModalVisible}
          onCancel={() => setIsNotificationModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsNotificationModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <BellOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
              <div style={{ marginTop: 16, color: "#999" }}>
                Chưa có thông báo nào
              </div>
            </div>
          ) : (
            <>
              {unreadCount > 0 && (
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button type="link" onClick={handleMarkAllAsRead}>
                    Đánh dấu tất cả đã đọc
                  </Button>
                </div>
              )}
              <div
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        backgroundColor: item.isRead
                          ? "transparent"
                          : "#e6f7ff",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        cursor: item.isRead ? "default" : "pointer",
                      }}
                      onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                      actions={
                        !item.isRead
                          ? [
                              <Button
                                key="mark-read"
                                type="link"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(item._id);
                                }}
                              >
                                Đánh dấu đã đọc
                              </Button>,
                            ]
                          : []
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={!item.isRead}>
                            <Avatar
                              icon={<BellOutlined />}
                              style={{
                                backgroundColor: item.isRead
                                  ? "#d9d9d9"
                                  : "#1890ff",
                              }}
                            />
                          </Badge>
                        }
                        title={
                          <Space>
                            <Text strong={!item.isRead}>{item.title}</Text>
                            {!item.isRead && <Tag color="blue">Mới</Tag>}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">{item.message}</Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </>
          )}
        </Modal>

        {/* Avatar Update Modal */}
        <Modal
          title="Cập nhật ảnh đại diện"
          open={isAvatarModalVisible}
          onCancel={() => {
            setFileList([]);
            setIsAvatarModalVisible(false);
          }}
          footer={null}
          width={500}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            {/* Avatar hiện tại */}
            <Avatar
              size={100}
              src={uploadService.getAvatarUrl(leaderInfo?.avatarUrl)}
              icon={
                leaderInfo?.gender === "MALE" ? (
                  <ManOutlined />
                ) : (
                  <WomanOutlined />
                )
              }
              style={{
                backgroundColor:
                  leaderInfo?.gender === "MALE" ? "#1890ff" : "#eb2f96",
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Ảnh đại diện hiện tại</Text>
            </div>
          </div>

          {/* Upload component */}
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            beforeUpload={(file) => {
              // Kiểm tra file type
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                message.error("Bạn chỉ có thể upload file ảnh!");
                return Upload.LIST_IGNORE;
              }
              // Kiểm tra file size (5MB)
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error("Ảnh phải nhỏ hơn 5MB!");
                return Upload.LIST_IGNORE;
              }
              return false; // Prevent auto upload
            }}
            onPreview={(file) => {
              // Preview ảnh
              const url = URL.createObjectURL(file.originFileObj);
              window.open(url);
            }}
            maxCount={1}
          >
            {fileList.length < 1 && (
              <div>
                <UploadOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  JPG, PNG, GIF (Max: 5MB)
                </div>
              </div>
            )}
          </Upload>

          {/* Buttons */}
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginTop: 24,
            }}
          >
            {leaderInfo?.avatarUrl && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteAvatar}
              >
                Xóa ảnh
              </Button>
            )}
            <Space style={{ marginLeft: "auto" }}>
              <Button
                onClick={() => {
                  setFileList([]);
                  setIsAvatarModalVisible(false);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpdateAvatar}
                loading={uploading}
                disabled={fileList.length === 0}
              >
                Upload
              </Button>
            </Space>
          </Space>
        </Modal>
      </div>
    </Layout>
  );
};

export default LeaderDashboard;
