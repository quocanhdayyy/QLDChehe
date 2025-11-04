import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  List,
  Tag,
  Avatar,
  Statistic,
  Spin,
  message,
  Modal,
  Descriptions,
  Alert,
  Form,
  Input,
  DatePicker,
  Select,
  Badge,
  Upload,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  GiftOutlined,
  BellOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ManOutlined,
  WomanOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  IdcardOutlined,
  CalendarOutlined,
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import {
  citizenService,
  editRequestService,
  notificationService,
  uploadService,
} from "../../services";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [householdData, setHouseholdData] = useState(null);
  const [citizenInfo, setCitizenInfo] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHouseholdModalVisible, setIsHouseholdModalVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching dashboard data for user:", user);

      // Fetch citizen info
      try {
        const citizenResponse = await citizenService.getMe();
        console.log("👤 Citizen info:", citizenResponse);
        console.log("🖼️ Citizen avatarUrl:", citizenResponse?.avatarUrl);
        setCitizenInfo(citizenResponse);
      } catch (err) {
        console.log("⚠️ Could not fetch citizen info:", err.message);
      }

      // Fetch household data
      const householdResponse = await citizenService.getMyHousehold();
      console.log("📊 Dashboard household response:", householdResponse);
      setHouseholdData(householdResponse);

      // Fetch requests
      try {
        const requestsResponse = await editRequestService.getMyRequests();
        const requests = requestsResponse.docs || requestsResponse || [];
        console.log("📋 Requests:", requests.length);
        setMyRequests(requests.slice(0, 5)); // Lấy 5 yêu cầu gần nhất
      } catch (err) {
        console.log("⚠️ No requests yet:", err.message);
        setMyRequests([]);
      }

      // Fetch reward proposals
      try {
        const rewardsResponse = await rewardService.proposals.getMyProposals();
        const rewards = rewardsResponse.docs || rewardsResponse || [];
        console.log("🏆 Reward Proposals:", rewards.length);
        setMyRewards(rewards.slice(0, 5)); // Lấy 5 đề xuất gần nhất
      } catch (err) {
        console.log("⚠️ No reward proposals yet:", err.message);
        setMyRewards([]);
      }

      // Fetch notifications (chỉ lấy phản hồi, không lấy yêu cầu mới)
      try {
        const notificationsResponse = await notificationService.getAll({
          limit: 50,
          sort: "-createdAt",
        });
        const allNotifs =
          notificationsResponse.docs || notificationsResponse || [];

        // Filter: CHỈ lấy thông báo "phản hồi" (title có "được duyệt" hoặc "bị từ chối")
        // Loại bỏ thông báo "yêu cầu mới"
        const responseNotifs = allNotifs.filter((n) => {
          const title = n.title || "";
          return title.includes("được duyệt") || title.includes("bị từ chối");
        });

        console.log(
          `📊 Total notifications: ${allNotifs.length}, Responses: ${responseNotifs.length}`
        );
        setNotifications(responseNotifs);
        const unread = responseNotifs.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.log("⚠️ No notifications yet:", err.message);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;

      if (error.response?.status === 404) {
        message.error({
          content: (
            <div>
              <div>❌ {errorMsg}</div>
              <div style={{ fontSize: "12px", marginTop: 8 }}>
                Vui lòng liên hệ tổ trưởng để được thêm vào hộ khẩu.
              </div>
            </div>
          ),
          duration: 8,
        });
      } else {
        message.error(`Không thể tải dữ liệu: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    profileForm.setFieldsValue({
      fullName: citizenInfo.fullName,
      avatarUrl: citizenInfo.avatarUrl || "",
      email: citizenInfo.email || "",
      phone: citizenInfo.phone || "",
      nationalId: citizenInfo.nationalId || "",
      dateOfBirth: citizenInfo.dateOfBirth
        ? dayjs(citizenInfo.dateOfBirth)
        : null,
      gender: citizenInfo.gender,
      ethnicity: citizenInfo.ethnicity || "Kinh",
      nationality: citizenInfo.nationality || "Việt Nam",
      educationLevel: citizenInfo.educationLevel || "",
      occupation: citizenInfo.occupation || "",
    });
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
      const updatedCitizen = await citizenService.updateMe(updateData);
      setCitizenInfo(updatedCitizen);
      message.success("Cập nhật thông tin thành công!");
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
      message.warning("Vui lòng chọn ảnh đại diện");
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj;
      console.log("📤 Uploading avatar file:", file.name);

      const response = await uploadService.uploadAvatar(file);
      console.log("📥 Upload response:", response);

      // Update citizen info với avatar mới
      setCitizenInfo(response.citizen);
      message.success("Cập nhật ảnh đại diện thành công!");

      // Reset form
      setFileList([]);
      setIsAvatarModalVisible(false);

      // Refresh dashboard data
      fetchDashboardData();
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
      const updatedCitizen = await citizenService.getMe();
      setCitizenInfo(updatedCitizen);
      message.success("Đã xóa ảnh đại diện");
      fetchDashboardData();
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

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      </Layout>
    );
  }

  if (!householdData) {
    return (
      <Layout>
        <Alert
          message="Không tìm thấy thông tin hộ khẩu"
          description="Bạn chưa được gán vào hộ khẩu nào. Vui lòng liên hệ tổ trưởng."
          type="warning"
          showIcon
        />
      </Layout>
    );
  }

  const { household, members = [] } = householdData;

  return (
    <Layout>
      <div>
        {/* Welcome Header */}
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  size={64}
                  src={uploadService.getAvatarUrl(citizenInfo?.avatarUrl)}
                  icon={!citizenInfo?.avatarUrl && <UserOutlined />}
                  style={{
                    backgroundColor: citizenInfo?.avatarUrl
                      ? "#fff"
                      : "#1890ff",
                  }}
                  onError={(e) => {
                    console.error(
                      "❌ Avatar image failed to load:",
                      citizenInfo?.avatarUrl
                    );
                    console.log("📋 Full citizenInfo:", citizenInfo);
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
                    bottom: -2,
                    right: -2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                />
              </div>
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ color: "white", marginBottom: 4 }}>
                Chào mừng trở lại,{" "}
                {citizenInfo?.fullName || user?.fullName || user?.username}!
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
                Hộ khẩu: {household?.code} | {members.length} thành viên
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Quick Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} hoverable>
              <Statistic
                title="Thành viên hộ gia đình"
                value={members.length}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} hoverable>
              <Statistic
                title="Yêu cầu đã gửi"
                value={myRequests.length}
                prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              hoverable
              onClick={() => setIsNotificationModalVisible(true)}
              style={{ cursor: "pointer" }}
            >
              <Statistic
                title="Thông báo chưa đọc"
                value={unreadCount}
                prefix={<BellOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Personal Information */}
        {citizenInfo && (
          <Card
            title={
              <Space>
                <IdcardOutlined />
                <span>Thông tin cá nhân</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditProfile}
              >
                Chỉnh sửa
              </Button>
            }
            bordered={false}
            style={{ marginBottom: 24 }}
          >
            <Row gutter={24}>
              <Col xs={24} sm={24} md={6}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Avatar
                    size={100}
                    src={uploadService.getAvatarUrl(citizenInfo.avatarUrl)}
                    icon={
                      !citizenInfo.avatarUrl &&
                      (citizenInfo.gender === "MALE" ? (
                        <ManOutlined />
                      ) : (
                        <WomanOutlined />
                      ))
                    }
                    style={{
                      backgroundColor: citizenInfo.avatarUrl
                        ? "#fff"
                        : citizenInfo.gender === "MALE"
                        ? "#1890ff"
                        : "#eb2f96",
                      marginBottom: 16,
                      border: "3px solid #f0f0f0",
                    }}
                  />
                  <Title level={4} style={{ marginBottom: 8 }}>
                    {citizenInfo.fullName}
                  </Title>
                  {citizenInfo.citizenCode && (
                    <Tag color="blue" style={{ fontSize: "13px" }}>
                      {citizenInfo.citizenCode}
                    </Tag>
                  )}
                </div>
              </Col>
              <Col xs={24} sm={24} md={18}>
                <Descriptions
                  column={{ xs: 1, sm: 1, md: 2 }}
                  bordered
                  size="middle"
                  labelStyle={{
                    fontWeight: 600,
                    backgroundColor: "#fafafa",
                    width: "auto",
                    minWidth: "120px",
                    whiteSpace: "nowrap",
                  }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    wordBreak: "break-word",
                    padding: "12px 16px",
                  }}
                >
                  <Descriptions.Item
                    label={
                      <>
                        <IdcardOutlined /> CCCD/CMND
                      </>
                    }
                  >
                    <Text strong>
                      {citizenInfo.nationalId || <Tag>Chưa có</Tag>}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined /> Ngày sinh
                      </>
                    }
                  >
                    {citizenInfo.dateOfBirth ? (
                      <>
                        <Text strong style={{ marginRight: 8 }}>
                          {dayjs(citizenInfo.dateOfBirth).format("DD/MM/YYYY")}
                        </Text>
                        <Tag color="purple">
                          {dayjs().diff(citizenInfo.dateOfBirth, "year")} tuổi
                        </Tag>
                      </>
                    ) : (
                      <Tag>Chưa có</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính">
                    <Tag
                      color={citizenInfo.gender === "MALE" ? "blue" : "magenta"}
                    >
                      {citizenInfo.gender === "MALE"
                        ? "Nam"
                        : citizenInfo.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Quan hệ">
                    {citizenInfo.relationshipToHead ? (
                      <Tag color="orange">{citizenInfo.relationshipToHead}</Tag>
                    ) : citizenInfo.isHead ? (
                      <Tag color="gold">Chủ hộ</Tag>
                    ) : (
                      <Tag>Chưa xác định</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dân tộc">
                    {citizenInfo.ethnicity || "Kinh"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quốc tịch">
                    {citizenInfo.nationality || "Việt Nam"}
                  </Descriptions.Item>
                  {citizenInfo.educationLevel && (
                    <Descriptions.Item label="Học vấn" span={2}>
                      <Tag color="cyan">{citizenInfo.educationLevel}</Tag>
                    </Descriptions.Item>
                  )}
                  {citizenInfo.occupation && (
                    <Descriptions.Item label="Nghề nghiệp" span={2}>
                      {citizenInfo.occupation}
                    </Descriptions.Item>
                  )}
                  {citizenInfo.email && (
                    <Descriptions.Item
                      label={
                        <>
                          <MailOutlined /> Email
                        </>
                      }
                      span={2}
                    >
                      <Text copyable>{citizenInfo.email}</Text>
                    </Descriptions.Item>
                  )}
                  {citizenInfo.phone && (
                    <Descriptions.Item
                      label={
                        <>
                          <PhoneOutlined /> SĐT
                        </>
                      }
                      span={2}
                    >
                      <Text copyable>{citizenInfo.phone}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
            </Row>
          </Card>
        )}

        <Row gutter={[16, 16]}>
          {/* Household Info */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  <span>Thông tin hộ khẩu</span>
                </Space>
              }
              extra={
                <Space>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setIsHouseholdModalVisible(true)}
                  >
                    Xem chi tiết
                  </Button>
                </Space>
              }
              bordered={false}
              style={{ height: "100%" }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text type="secondary">Mã hộ khẩu:</Text>
                  <br />
                  <Text strong>
                    <Tag color="blue">{household?.code}</Tag>
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Chủ hộ:</Text>
                  <br />
                  <Text strong>{household?.headName}</Text>
                </div>
                <div>
                  <Text type="secondary">Địa chỉ:</Text>
                  <br />
                  <Text strong>
                    {household?.address?.street}, {household?.address?.ward},{" "}
                    {household?.address?.district}, {household?.address?.city}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Số thành viên:</Text>
                  <br />
                  <Text strong>{members.length} người</Text>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={12}>
            <Card
              title="Thao tác nhanh"
              bordered={false}
              style={{ height: "100%" }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  size="large"
                  block
                  onClick={() => navigate("/citizen/submit-edit-request")}
                >
                  Yêu cầu chỉnh sửa
                </Button>
                <Button
                  type="default"
                  icon={<TrophyOutlined />}
                  size="large"
                  block
                  onClick={() => navigate("/citizen/submit-reward-proposal")}
                >
                  Đề xuất khen thưởng
                </Button>
                <Button
                  type="default"
                  icon={<TeamOutlined />}
                  size="large"
                  block
                  onClick={() => navigate("/citizen/household")}
                >
                  Xem hộ khẩu của tôi
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* Recent Requests */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Yêu cầu gần đây</span>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate("/citizen/my-requests")}
                >
                  Xem tất cả
                </Button>
              }
              bordered={false}
            >
              {myRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <FileTextOutlined
                    style={{ fontSize: 48, color: "#d9d9d9" }}
                  />
                  <div style={{ marginTop: 16, color: "#999" }}>
                    Chưa có yêu cầu nào
                  </div>
                  <Button
                    type="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => navigate("/citizen/submit-edit-request")}
                  >
                    Gửi yêu cầu đầu tiên
                  </Button>
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={myRequests}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={
                              statusConfig[item.status]?.icon || (
                                <ClockCircleOutlined />
                              )
                            }
                            style={{
                              backgroundColor:
                                item.status === "APPROVED"
                                  ? "#52c41a"
                                  : item.status === "REJECTED"
                                  ? "#ff4d4f"
                                  : "#faad14",
                            }}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{item.title || item.requestType}</Text>
                            <Tag
                              color={
                                statusConfig[item.status]?.color || "default"
                              }
                            >
                              {statusConfig[item.status]?.text || item.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              {item._id?.substring(0, 8)}...
                            </Text>
                            <Text type="secondary">
                              {dayjs(item.createdAt).format("DD/MM/YYYY")}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* Recent Notifications */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <Badge count={unreadCount} offset={[10, 0]}>
                    <BellOutlined />
                  </Badge>
                  <span>Thông báo</span>
                </Space>
              }
              extra={
                <Space>
                  {unreadCount > 0 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={handleMarkAllAsRead}
                    >
                      Đánh dấu tất cả đã đọc
                    </Button>
                  )}
                  <Button
                    type="link"
                    onClick={() => setIsNotificationModalVisible(true)}
                  >
                    Xem tất cả
                  </Button>
                </Space>
              }
              bordered={false}
            >
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <BellOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  <div style={{ marginTop: 16, color: "#999" }}>
                    Chưa có thông báo nào
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          !item.isRead && handleMarkAsRead(item._id)
                        }
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
                              <Text
                                type="secondary"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {item.message}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                {dayjs(item.createdAt).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Household Detail Modal */}
        <Modal
          title={
            <Space>
              <TeamOutlined />
              <span>Chi Tiết Hộ Khẩu - {household?.code}</span>
            </Space>
          }
          open={isHouseholdModalVisible}
          onCancel={() => setIsHouseholdModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsHouseholdModalVisible(false)}
            >
              Đóng
            </Button>,
            <Button
              key="view"
              type="primary"
              onClick={() => {
                setIsHouseholdModalVisible(false);
                navigate("/citizen/household");
              }}
            >
              Xem trang đầy đủ
            </Button>,
          ]}
          width={900}
        >
          {household && (
            <div>
              <Card
                title="Thông tin hộ khẩu"
                bordered={false}
                style={{ marginBottom: 16 }}
              >
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Mã hộ khẩu">
                    <Tag color="blue" style={{ fontSize: "14px" }}>
                      {household.code}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chủ hộ">
                    <strong>{household.headName}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {household.phone || <Tag color="default">Chưa có</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số thành viên">
                    <Tag color="blue" style={{ fontSize: "14px" }}>
                      {members.length} người
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {household.address?.street}, {household.address?.ward},{" "}
                    {household.address?.district}, {household.address?.city}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    <span>Danh sách thành viên ({members.length} người)</span>
                  </Space>
                }
                bordered={false}
              >
                {members.length > 0 ? (
                  <List
                    dataSource={members}
                    renderItem={(member) => (
                      <List.Item
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          backgroundColor: member.isHead
                            ? "#e6f7ff"
                            : "#fafafa",
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={
                                member.gender === "MALE" ? (
                                  <ManOutlined />
                                ) : (
                                  <WomanOutlined />
                                )
                              }
                              style={{
                                backgroundColor:
                                  member.gender === "MALE"
                                    ? "#1890ff"
                                    : "#eb2f96",
                              }}
                            />
                          }
                          title={
                            <Space>
                              <strong>{member.fullName}</strong>
                              {member.isHead && <Tag color="gold">Chủ hộ</Tag>}
                              {member.relationshipToHead && (
                                <Tag color="purple">
                                  {member.relationshipToHead}
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <Space split="|">
                              <span>
                                {dayjs().diff(member.dateOfBirth, "year")} tuổi
                              </span>
                              <span>
                                {member.gender === "MALE"
                                  ? "Nam"
                                  : member.gender === "FEMALE"
                                  ? "Nữ"
                                  : "Khác"}
                              </span>
                              {member.nationalId && (
                                <span>CCCD: {member.nationalId}</span>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#999",
                    }}
                  >
                    <TeamOutlined
                      style={{ fontSize: "48px", marginBottom: "16px" }}
                    />
                    <div>Chưa có thành viên nào</div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          title={
            <Space>
              <EditOutlined />
              <span>Chỉnh sửa thông tin cá nhân</span>
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
                  Lưu thay đổi
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
              src={uploadService.getAvatarUrl(citizenInfo?.avatarUrl)}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#1890ff",
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
            {citizenInfo?.avatarUrl && (
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

export default CitizenDashboard;
