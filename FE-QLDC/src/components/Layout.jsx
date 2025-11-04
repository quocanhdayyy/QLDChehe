import { useState, useEffect, useCallback } from "react";
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Modal,
  List,
  Space,
  Tag,
  message,
  Typography,
  Form,
  Input,
} from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  GiftOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AuditOutlined,
  TrophyOutlined,
  LockOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  notificationService,
  citizenService,
  uploadService,
  authService,
} from "../services";
import dayjs from "dayjs";

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isLeader = user?.role === "TO_TRUONG";

  // Fetch user avatar
  const fetchUserAvatar = useCallback(async () => {
    try {
      const citizenInfo = await citizenService.getMe();
      setAvatarUrl(citizenInfo.avatarUrl);
    } catch (error) {
      console.log("Could not fetch avatar:", error.message);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserAvatar();
    }
  }, [user, fetchUserAvatar]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getAll({ limit: 100 });
      const allNotifs = response.docs || [];

      // Backend đã filter đúng theo toUser rồi, không cần filter thêm!
      setNotifications(allNotifs);
      const unread = allNotifs.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Refresh when user navigates
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUserAvatar(); // Refresh avatar khi navigate
    }
  }, [location.pathname, user, fetchNotifications, fetchUserAvatar]);

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

  const handleChangePassword = async (values) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword(
        values.currentPassword,
        values.newPassword
      );
      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
      setIsChangePasswordModalVisible(false);
    } catch (error) {
      console.error("Error changing password:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Menu items cho Leader (Tổ trưởng)
  const leaderMenuItems = [
    {
      key: "/leader/dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/leader/dashboard"),
    },
    {
      key: "/leader/households",
      icon: <TeamOutlined />,
      label: "Quản lý Hộ khẩu",
      onClick: () => navigate("/leader/households"),
    },
    {
      key: "/leader/citizens",
      icon: <UserOutlined />,
      label: "Quản lý Nhân khẩu",
      onClick: () => navigate("/leader/citizens"),
    },
    {
      key: "/leader/edit-requests",
      icon: <FileTextOutlined />,
      label: "Duyệt Yêu cầu",
      onClick: () => navigate("/leader/edit-requests"),
    },
    {
      key: "rewards",
      icon: <GiftOutlined />,
      label: "Khen thưởng",
      children: [
        {
          key: "/leader/reward-proposals",
          label: "Duyệt Đề xuất",
          onClick: () => navigate("/leader/reward-proposals"),
        },
        {
          key: "/leader/reward-events",
          label: "Sự kiện phát quà",
          onClick: () => navigate("/leader/reward-events"),
        },
            {
              key: "/leader/gift-events",
              label: "Sự kiện phát quà (Quà tặng)",
              onClick: () => navigate("/leader/gift-events"),
            },
        {
          key: "/leader/reward-distributions",
          label: "Phân phối quà",
          onClick: () => navigate("/leader/reward-distributions"),
        },
        {
          key: "/leader/student-achievements",
          label: "Thành tích học sinh",
          onClick: () => navigate("/leader/student-achievements"),
        },
      ],
    },
    {
      key: "/leader/audit-logs",
      icon: <AuditOutlined />,
      label: "Nhật ký",
      onClick: () => navigate("/leader/audit-logs"),
    },
  ];

  // Menu items cho Citizen (Công dân)
  const citizenMenuItems = [
    {
      key: "/events",
      icon: <GiftOutlined />,
      label: "Sự kiện - Phát quà",
      onClick: () => navigate("/events"),
    },
    {
      key: "/citizen/dashboard",
      icon: <HomeOutlined />,
      label: "Trang chủ",
      onClick: () => navigate("/citizen/dashboard"),
    },
    {
      key: "/citizen/household",
      icon: <TeamOutlined />,
      label: "Hộ khẩu của tôi",
      onClick: () => navigate("/citizen/household"),
    },
    {
      key: "/citizen/submit-edit-request",
      icon: <FileTextOutlined />,
      label: "Yêu cầu chỉnh sửa",
      onClick: () => navigate("/citizen/submit-edit-request"),
    },
    {
      key: "/citizen/submit-reward-proposal",
      icon: <TrophyOutlined />,
      label: "Đề xuất khen thưởng",
      onClick: () => navigate("/citizen/submit-reward-proposal"),
    },
    {
      key: "/citizen/my-requests",
      icon: <FileTextOutlined />,
      label: "Yêu cầu của tôi",
      onClick: () => navigate("/citizen/my-requests"),
    },
    {
      key: "/citizen/my-rewards",
      icon: <GiftOutlined />,
      label: "Khen thưởng của tôi",
      onClick: () => navigate("/citizen/my-rewards"),
    },
  ];

  const menuItems = isLeader ? leaderMenuItems : citizenMenuItems;

  // User menu dropdown
  const userMenuItems = [
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Đổi mật khẩu",
      onClick: () => {
        setIsChangePasswordModalVisible(true);
      },
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: collapsed ? 16 : 20,
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {collapsed ? "QLDC" : "Quản Lý Dân Cư"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      {/* Main Layout */}
      <AntLayout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Notifications */}
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                onClick={() => setIsNotificationModalVisible(true)}
              />
            </Badge>

            {/* User Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <Avatar
                  src={uploadService.getAvatarUrl(avatarUrl)}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: avatarUrl ? "#fff" : "#1890ff",
                  }}
                />
                <span>{user?.fullName || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: "24px",
            padding: 24,
            minHeight: 280,
            background: "#f0f2f5",
          }}
        >
          {children}
        </Content>
      </AntLayout>

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
            </div>
          </>
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined />
            <span>Đổi mật khẩu</span>
          </Space>
        }
        open={isChangePasswordModalVisible}
        onCancel={() => {
          passwordForm.resetFields();
          setIsChangePasswordModalVisible(false);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu hiện tại",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu mới",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={passwordLoading}
              >
                Đổi mật khẩu
              </Button>
              <Button
                size="large"
                onClick={() => {
                  passwordForm.resetFields();
                  setIsChangePasswordModalVisible(false);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AntLayout>
  );
};

export default Layout;
