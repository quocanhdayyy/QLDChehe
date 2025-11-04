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
  DatePicker,
  message,
  Popconfirm,
  Avatar,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { citizenService, householdService } from "../../services";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const CitizenManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState(null);
  const [viewingCitizen, setViewingCitizen] = useState(null);
  const [form] = Form.useForm();
  const [citizens, setCitizens] = useState([]);
  const [households, setHouseholds] = useState([]);

  // Fetch citizens from API
  useEffect(() => {
    fetchCitizens();
    fetchHouseholds();
  }, []);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const response = await citizenService.getAll();
      // Backend returns { docs, total, page, limit }
      const data = response.docs || response || [];
      setCitizens(
        data.map((c) => ({
          key: c._id,
          id: c.code || c._id,
          fullName: c.fullName,
          dateOfBirth: c.dateOfBirth,
          gender:
            c.gender === "MALE" ? "Nam" : c.gender === "FEMALE" ? "Nữ" : "Khác",
          genderValue: c.gender, // Keep original for edit
          idCard: c.nationalId, // Backend uses 'nationalId'
          household: c.household?.code || "Chưa có hộ khẩu",
          householdId: c.household?._id || c.household,
          relationship: c.relationshipToHead,
          phone: c.phone,
          status: c.status === "ALIVE" ? "active" : "inactive",
          statusValue: c.status, // Keep original
        }))
      );
    } catch (error) {
      console.error("Error fetching citizens:", error);
      message.error("Không thể tải danh sách nhân khẩu");
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const response = await householdService.getAll();
      // Backend returns { docs, total, page, limit }
      const data = response.docs || response || [];
      setHouseholds(data);
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  };

  const columns = [
    {
      title: "Thông tin nhân khẩu",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <div>
          <Space style={{ marginBottom: 4 }}>
            <Avatar
              size="default"
              icon={
                record.gender === "Nam" ? <ManOutlined /> : <WomanOutlined />
              }
              style={{
                backgroundColor:
                  record.gender === "Nam" ? "#1890ff" : "#eb2f96",
              }}
            />
            <div>
              <div
                style={{ fontWeight: 600, fontSize: "14px", color: "#262626" }}
              >
                {text}
              </div>
              <Space size={4} style={{ fontSize: "12px", color: "#8c8c8c" }}>
                <span>{record.gender}</span>
                <span>•</span>
                <span>{dayjs(record.dateOfBirth).format("DD/MM/YYYY")}</span>
                {record.idCard && (
                  <>
                    <span>•</span>
                    <span>{record.idCard}</span>
                  </>
                )}
              </Space>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "Hộ khẩu & Quan hệ",
      dataIndex: "household",
      key: "household",
      render: (household, record) => (
        <div>
          <div style={{ marginBottom: 4, fontSize: "13px" }}>
            <Tag color="blue" style={{ margin: 0 }}>
              {household}
            </Tag>
          </div>
          {record.relationship && (
            <Tag color="purple" style={{ fontSize: "12px" }}>
              {record.relationship}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag
          color={status === "active" ? "success" : "default"}
          style={{ fontSize: "13px", padding: "2px 12px" }}
        >
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
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
            title="⚠️ Xóa vĩnh viễn nhân khẩu này?"
            description="Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống và không thể khôi phục!"
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

  const handleView = (record) => {
    setViewingCitizen(record);
    setIsViewModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCitizen(record);
    form.setFieldsValue({
      fullName: record.fullName,
      dateOfBirth: dayjs(record.dateOfBirth),
      gender: record.gender, // "Nam" or "Nữ" - đúng cho Select
      idCard: record.idCard,
      household: record.householdId,
      relationship: record.relationship,
      phone: record.phone,
      status: record.status, // "active" or "inactive" - đúng cho Select
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (key) => {
    try {
      await citizenService.delete(key);
      message.success({
        content: "✅ Đã xóa vĩnh viễn nhân khẩu khỏi hệ thống",
        duration: 3,
      });
      fetchCitizens(); // Refresh list
      console.log(`🗑️ Deleted citizen: ${key}`);
    } catch (error) {
      console.error("Error deleting citizen:", error);
      const errorMsg = error.response?.data?.message || error.message;
      message.error(`Không thể xóa nhân khẩu: ${errorMsg}`);
    }
  };

  const handleAdd = () => {
    setEditingCitizen(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const citizenData = {
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
        gender:
          values.gender === "Nam"
            ? "MALE"
            : values.gender === "Nữ"
            ? "FEMALE"
            : "OTHER",
        nationalId: values.idCard, // Backend uses 'nationalId', not 'idCard'
        phone: values.phone,
        status: values.status === "active" ? "ALIVE" : "MOVED_OUT",
      };

      // Chỉ thêm household nếu có giá trị
      if (values.household) {
        citizenData.household = values.household;
      }

      // Chỉ thêm relationshipToHead nếu có giá trị
      if (values.relationship) {
        citizenData.relationshipToHead = values.relationship;
      }

      if (editingCitizen) {
        // Update existing citizen
        await citizenService.update(editingCitizen.key, citizenData);
        message.success("Cập nhật nhân khẩu thành công");
      } else {
        // Create new citizen
        await citizenService.create(citizenData);
        message.success("Thêm nhân khẩu mới thành công");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingCitizen(null);
      fetchCitizens(); // Refresh list
    } catch (error) {
      console.error("Error saving citizen:", error);
      const errorMsg = error.response?.data?.message || error.message;
      message.error(
        editingCitizen
          ? `Không thể cập nhật: ${errorMsg}`
          : `Không thể thêm mới: ${errorMsg}`
      );
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCitizen(null);
  };

  const filteredCitizens = citizens.filter((citizen) =>
    Object.values(citizen).some(
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            padding: "24px 32px",
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
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
              <UserOutlined style={{ fontSize: "28px", color: "#fff" }} />
            </div>
            <div>
              <Title
                level={2}
                style={{ margin: 0, color: "#fff", fontSize: "24px" }}
              >
                Quản Lý Nhân Khẩu
              </Title>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                Quản lý thông tin cá nhân của các nhân khẩu trong khu vực
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
              placeholder="Tìm kiếm theo tên, CCCD, số điện thoại..."
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
              Thêm nhân khẩu mới
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
            dataSource={filteredCitizens}
            loading={loading}
            pagination={{
              total: filteredCitizens.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nhân khẩu`,
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
              <Avatar
                icon={
                  viewingCitizen?.gender === "Nam" ? (
                    <ManOutlined />
                  ) : (
                    <WomanOutlined />
                  )
                }
                style={{
                  backgroundColor:
                    viewingCitizen?.gender === "Nam" ? "#1890ff" : "#eb2f96",
                }}
              />
              <span>Thông Tin Nhân Khẩu - {viewingCitizen?.fullName}</span>
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
                handleEdit(viewingCitizen);
              }}
            >
              Chỉnh sửa
            </Button>,
          ]}
          width={800}
        >
          {viewingCitizen && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Họ và tên" span={2}>
                <Text strong>{viewingCitizen.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã nhân khẩu">
                <Tag color="blue">{viewingCitizen.id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Tag color={viewingCitizen.gender === "Nam" ? "blue" : "pink"}>
                  {viewingCitizen.gender}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {dayjs(viewingCitizen.dateOfBirth).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD/CMND">
                {viewingCitizen.idCard || <Tag color="default">Chưa có</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại" span={2}>
                {viewingCitizen.phone || <Tag color="default">Chưa có</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Hộ khẩu">
                {viewingCitizen.household === "Chưa có hộ khẩu" ? (
                  <Tag color="default">Chưa có hộ khẩu</Tag>
                ) : (
                  <Tag color="blue">{viewingCitizen.household}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Quan hệ với chủ hộ">
                {viewingCitizen.relationship ? (
                  <Tag color="purple">{viewingCitizen.relationship}</Tag>
                ) : (
                  <Tag color="default">N/A</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag
                  color={
                    viewingCitizen.status === "active" ? "success" : "default"
                  }
                >
                  {viewingCitizen.status === "active"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Add/Edit Modal */}
        <Modal
          title={editingCitizen ? "Chỉnh sửa nhân khẩu" : "Thêm nhân khẩu mới"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={700}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ và tên đầy đủ" />
            </Form.Item>

            <Space style={{ width: "100%" }} size="large">
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                style={{ flex: 1 }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Space>

            <Form.Item name="idCard" label="CCCD/CMND">
              <Input placeholder="Nhập số CCCD/CMND" maxLength={12} />
            </Form.Item>

            <Space style={{ width: "100%" }} size="large">
              <Form.Item
                name="household"
                label="Hộ khẩu (không bắt buộc - có thể gán sau)"
                style={{ flex: 1 }}
              >
                <Select
                  placeholder="Chọn hộ khẩu (hoặc bỏ trống)"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {Array.isArray(households) &&
                    households.map((h) => (
                      <Option key={h._id} value={h._id}>
                        {h.code || h._id} - {h.headOfHousehold}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="relationship"
                label="Quan hệ với chủ hộ (nếu có)"
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn quan hệ">
                  <Option value="Chủ hộ">Chủ hộ</Option>
                  <Option value="Vợ">Vợ</Option>
                  <Option value="Chồng">Chồng</Option>
                  <Option value="Con">Con</Option>
                  <Option value="Cha">Cha</Option>
                  <Option value="Mẹ">Mẹ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Space>

            <Form.Item name="phone" label="Số điện thoại">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              initialValue="active"
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CitizenManagement;
