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
  Form,
  Select,
  message,
  Popconfirm,
  Descriptions,
  Avatar,
  List,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { householdService, citizenService } from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;

const HouseholdManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [viewingHousehold, setViewingHousehold] = useState(null);
  const [form] = Form.useForm();
  const [households, setHouseholds] = useState([]);
  const [citizens, setCitizens] = useState([]);

  // Fetch households and citizens from API
  useEffect(() => {
    fetchHouseholds();
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const response = await citizenService.getAll();
      const data = response.docs || response || [];
      setCitizens(data);
    } catch (error) {
      console.error("Error fetching citizens:", error);
    }
  };

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const response = await householdService.getAll();
      // Backend returns { docs, total, page, limit }
      const data = response.docs || response || [];
      setHouseholds(
        data.map((h) => ({
          key: h._id,
          id: h.code || h._id,
          headOfHousehold: h.head?.fullName || "N/A",
          headId: h.head?._id || h.head,
          address: h.address
            ? `${h.address.street || ""}, ${h.address.ward || ""}, ${
                h.address.district || ""
              }, ${h.address.city || ""}`.replace(/^,\s*|,\s*,/g, "")
            : "N/A",
          addressObject: h.address,
          members: h.members?.length || 0,
          phone: h.phone,
          status: h.status || "ACTIVE",
        }))
      );
    } catch (error) {
      console.error("Error fetching households:", error);
      message.error("Không thể tải danh sách hộ khẩu");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Thông tin hộ khẩu",
      dataIndex: "id",
      key: "id",
      render: (text, record) => (
        <div>
          <Space style={{ marginBottom: 4 }}>
            <Avatar
              size="default"
              icon={<TeamOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <div>
              <div
                style={{ fontWeight: 600, fontSize: "14px", color: "#262626" }}
              >
                {text}
              </div>
              <Space size={4} style={{ fontSize: "12px", color: "#8c8c8c" }}>
                <UserOutlined style={{ fontSize: "11px" }} />
                <span>{record.headOfHousehold}</span>
                {record.phone && (
                  <>
                    <span>•</span>
                    <PhoneOutlined style={{ fontSize: "11px" }} />
                    <span>{record.phone}</span>
                  </>
                )}
              </Space>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <div style={{ fontSize: "13px" }}>
          <Space size={4}>
            <EnvironmentOutlined
              style={{ color: "#8c8c8c", fontSize: "12px" }}
            />
            <span style={{ color: "#595959" }}>{address}</span>
          </Space>
        </div>
      ),
    },
    {
      title: "Thành viên",
      dataIndex: "members",
      key: "members",
      align: "center",
      render: (num) => (
        <Tag color="blue" style={{ fontSize: "13px", padding: "4px 12px" }}>
          <TeamOutlined style={{ marginRight: 4 }} />
          {num} người
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const statusConfig = {
          ACTIVE: { color: "success", text: "Hoạt động" },
          MOVED: { color: "warning", text: "Đã chuyển đi" },
          SPLIT: { color: "processing", text: "Đã tách hộ" },
          MERGED: { color: "purple", text: "Đã gộp hộ" },
          INACTIVE: { color: "default", text: "Không hoạt động" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return (
          <Tag
            color={config.color}
            style={{ fontSize: "13px", padding: "2px 12px" }}
          >
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
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="⚠️ Xóa vĩnh viễn hộ khẩu này?"
            description={
              <div>
                <div>Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống!</div>
                <div style={{ color: "#ff4d4f", marginTop: 4 }}>
                  ⚠️ Các thành viên sẽ mất thông tin hộ khẩu
                </div>
              </div>
            }
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa vĩnh viễn"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleView = async (record) => {
    // Fetch chi tiết household để lấy danh sách members
    try {
      const response = await householdService.getById(record.key);
      setViewingHousehold({
        ...record,
        membersList: response.members || [],
        headDetails: response.head,
      });
      setIsViewModalVisible(true);
    } catch (error) {
      console.error("Error fetching household details:", error);
      message.error("Không thể tải thông tin hộ khẩu");
    }
  };

  const handleEdit = (record) => {
    setEditingHousehold(record);
    form.setFieldsValue({
      code: record.id,
      head: record.headId,
      street: record.addressObject?.street || "",
      ward: record.addressObject?.ward || "",
      district: record.addressObject?.district || "",
      city: record.addressObject?.city || "",
      phone: record.phone,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (key) => {
    try {
      await householdService.delete(key);
      message.success({
        content: "✅ Đã xóa vĩnh viễn hộ khẩu khỏi hệ thống",
        duration: 3,
      });
      fetchHouseholds(); // Refresh list
      fetchCitizens(); // Refresh citizens too (để cập nhật các citizen đã bị xóa household)
      console.log(`🗑️ Deleted household: ${key}`);
    } catch (error) {
      console.error("Error deleting household:", error);
      const errorMsg = error.response?.data?.message || error.message;
      message.error(`Không thể xóa hộ khẩu: ${errorMsg}`);
    }
  };

  const handleAdd = () => {
    setEditingHousehold(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const householdData = {
        code: values.code,
        head: values.head,
        address: {
          street: values.street,
          ward: values.ward,
          district: values.district,
          city: values.city,
        },
        // phone không cần gửi - backend tự động lấy từ chủ hộ
        status: values.status,
      };

      if (editingHousehold) {
        // Update existing household
        await householdService.update(editingHousehold.key, householdData);
        message.success("Cập nhật hộ khẩu thành công");
      } else {
        // Create new household
        const result = await householdService.create(householdData);

        // Tìm thông tin chủ hộ để hiển thị thông tin đăng nhập
        const headCitizen = citizens.find((c) => c._id === values.head);

        if (headCitizen && headCitizen.phone) {
          Modal.success({
            title: "✅ Tạo hộ khẩu thành công!",
            width: 500,
            content: (
              <div style={{ padding: "16px 0" }}>
                <div
                  style={{
                    padding: "16px",
                    background: "#f0f5ff",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "12px",
                      color: "#1890ff",
                    }}
                  >
                    🔐 Tài khoản đăng nhập cho chủ hộ
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ color: "#666" }}>📱 Username:</span>{" "}
                    <strong style={{ fontSize: "16px", color: "#000" }}>
                      {headCitizen.phone}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#666" }}>🔑 Password:</span>{" "}
                    <strong style={{ fontSize: "16px", color: "#000" }}>
                      123456
                    </strong>
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  ⚠️ <strong>Lưu ý:</strong> Chủ hộ có thể đăng nhập vào hệ
                  thống citizen bằng số điện thoại và mật khẩu trên.
                </div>
              </div>
            ),
            okText: "Đã hiểu",
          });
        } else {
          message.success("Thêm hộ khẩu mới thành công");
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingHousehold(null);
      fetchHouseholds(); // Refresh list
    } catch (error) {
      console.error("Error saving household:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);

      const errorMsg = error.response?.data?.message || error.message;
      message.error(
        editingHousehold
          ? `Không thể cập nhật: ${errorMsg}`
          : `Không thể thêm mới: ${errorMsg}`
      );
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingHousehold(null);
  };

  const filteredHouseholds = households.filter((household) =>
    Object.values(household).some(
      (value) =>
        value != null &&
        value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            borderRadius: "12px",
            padding: "24px 32px",
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(17, 153, 142, 0.15)",
          }}
        >
          <Space align="center" size={16}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HomeOutlined style={{ fontSize: "28px", color: "#fff" }} />
            </div>
            <div>
              <Title
                level={2}
                style={{ margin: 0, color: "#fff", fontSize: "24px" }}
              >
                Quản Lý Hộ Khẩu
              </Title>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                Quản lý thông tin các hộ gia đình trong khu vực
              </div>
            </div>
          </Space>
        </div>

        {/* Action Bar */}
        <Card
          bordered={false}
          style={{
            marginBottom: 16,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Space
            style={{ width: "100%", justifyContent: "space-between" }}
            wrap
          >
            <Input
              placeholder="Tìm kiếm theo mã hộ khẩu, chủ hộ, địa chỉ..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              style={{
                width: 350,
                borderRadius: "8px",
              }}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              style={{ borderRadius: "8px" }}
            >
              Thêm hộ khẩu mới
            </Button>
          </Space>
        </Card>

        {/* Table */}
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredHouseholds}
            loading={loading}
            pagination={{
              total: filteredHouseholds.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hộ khẩu`,
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "" : "table-row-light"
            }
          />
        </Card>

        {/* View Modal */}
        <Modal
          title={
            <Space>
              <TeamOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <span>Chi Tiết Hộ Khẩu - {viewingHousehold?.id}</span>
            </Space>
          }
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Đóng
            </Button>,
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setIsViewModalVisible(false);
                handleEdit(viewingHousehold);
              }}
            >
              Chỉnh sửa
            </Button>,
          ]}
          width={900}
        >
          {viewingHousehold && (
            <div>
              <Descriptions
                column={2}
                bordered
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="Mã hộ khẩu">
                  <Tag color="blue">{viewingHousehold.id}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {(() => {
                    const statusConfig = {
                      ACTIVE: { color: "success", text: "Hoạt động" },
                      MOVED: { color: "warning", text: "Đã chuyển đi" },
                      SPLIT: { color: "processing", text: "Đã tách hộ" },
                      MERGED: { color: "purple", text: "Đã gộp hộ" },
                      INACTIVE: { color: "default", text: "Không hoạt động" },
                    };
                    const config = statusConfig[viewingHousehold.status] || {
                      color: "default",
                      text: viewingHousehold.status,
                    };
                    return <Tag color={config.color}>{config.text}</Tag>;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Chủ hộ">
                  <Space>
                    <UserOutlined />
                    <Text strong>{viewingHousehold.headOfHousehold}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <Space>
                    <PhoneOutlined />
                    {viewingHousehold.phone || (
                      <Tag color="default">Chưa có</Tag>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  <Space>
                    <EnvironmentOutlined />
                    {viewingHousehold.address}
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              <div
                style={{
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Text strong>
                  <TeamOutlined /> Danh sách thành viên (
                  {viewingHousehold.membersList?.length || 0} người)
                </Text>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {viewingHousehold.membersList &&
                viewingHousehold.membersList.length > 0 ? (
                  <List
                    dataSource={viewingHousehold.membersList}
                    renderItem={(member, index) => (
                      <List.Item
                        key={member._id}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          backgroundColor:
                            member._id === viewingHousehold.headId
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
                              {member._id === viewingHousehold.headId && (
                                <Tag color="gold">Chủ hộ</Tag>
                              )}
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
                                {member.gender === "MALE"
                                  ? "Nam"
                                  : member.gender === "FEMALE"
                                  ? "Nữ"
                                  : "Khác"}
                              </span>
                              {member.nationalId && (
                                <span>CCCD: {member.nationalId}</span>
                              )}
                              {member.phone && <span>SĐT: {member.phone}</span>}
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
              </div>
            </div>
          )}
        </Modal>

        {/* Add/Edit Modal */}
        <Modal
          title={editingHousehold ? "Chỉnh sửa hộ khẩu" : "Thêm hộ khẩu mới"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="code"
              label="Mã hộ khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mã hộ khẩu" }]}
            >
              <Input
                placeholder="Nhập mã hộ khẩu (VD: HK-001)"
                disabled={!!editingHousehold}
              />
            </Form.Item>

            <Form.Item
              name="head"
              label="Chủ hộ"
              rules={[{ required: true, message: "Vui lòng chọn chủ hộ" }]}
            >
              <Select
                placeholder="Chọn chủ hộ"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(headId) => {
                  // Tự động fill số điện thoại từ chủ hộ
                  const selectedCitizen = citizens.find(
                    (c) => c._id === headId
                  );
                  if (selectedCitizen?.phone) {
                    form.setFieldsValue({ phone: selectedCitizen.phone });
                  }
                }}
              >
                {Array.isArray(citizens) &&
                  citizens.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.fullName} - {c.nationalId || "Chưa có CCCD"}
                      {c.phone && ` - ${c.phone}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Space style={{ width: "100%" }} size="large">
              <Form.Item
                name="street"
                label="Số nhà / Đường"
                style={{ flex: 1 }}
              >
                <Input placeholder="Nhập số nhà, đường" />
              </Form.Item>

              <Form.Item name="ward" label="Phường / Xã" style={{ flex: 1 }}>
                <Input placeholder="Nhập phường/xã" />
              </Form.Item>
            </Space>

            <Space style={{ width: "100%" }} size="large">
              <Form.Item
                name="district"
                label="Quận / Huyện"
                style={{ flex: 1 }}
              >
                <Input placeholder="Nhập quận/huyện" />
              </Form.Item>

              <Form.Item
                name="city"
                label="Tỉnh / Thành phố"
                style={{ flex: 1 }}
              >
                <Input placeholder="Nhập tỉnh/thành phố" />
              </Form.Item>
            </Space>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              tooltip="Số điện thoại tự động lấy từ chủ hộ"
            >
              <Input
                placeholder="Tự động lấy từ chủ hộ"
                disabled
                style={{ color: "#000" }}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              initialValue="ACTIVE"
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="ACTIVE">Hoạt động</Option>
                <Option value="MOVED">Đã chuyển đi</Option>
                <Option value="SPLIT">Đã tách hộ</Option>
                <Option value="MERGED">Đã gộp hộ</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HouseholdManagement;
