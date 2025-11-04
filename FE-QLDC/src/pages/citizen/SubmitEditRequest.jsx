import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  message,
  Alert,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  EditOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { editRequestService } from "../../services";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SubmitEditRequest = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const requestTypes = [
    { value: "ADD_MEMBER", label: "Thêm nhân khẩu", icon: <UserAddOutlined /> },
    {
      value: "EDIT_INFO",
      label: "Chỉnh sửa thông tin",
      icon: <EditOutlined />,
    },
    {
      value: "REMOVE_MEMBER",
      label: "Xóa nhân khẩu",
      icon: <UserDeleteOutlined />,
    },
    {
      value: "TEMP_ABSENCE",
      label: "Đăng ký tạm vắng",
      icon: <SwapOutlined />,
    },
    {
      value: "TEMP_RESIDENCE",
      label: "Đăng ký tạm trú",
      icon: <SwapOutlined />,
    },
    { value: "MOVE_OUT", label: "Chuyển đi", icon: <SwapOutlined /> },
    { value: "MOVE_IN", label: "Chuyển đến", icon: <SwapOutlined /> },
    { value: "OTHER", label: "Khác", icon: <InfoCircleOutlined /> },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log("📤 Submitting request with values:", values);

      const requestData = {
        requestType: values.requestType,
        title: values.title,
        description: values.description,
        proposedChanges: {
          details: values.details,
          ...values,
        },
      };

      console.log("📤 Request data:", requestData);
      const response = await editRequestService.create(requestData);
      console.log("✅ Response:", response);

      // Reset form trước
      form.resetFields();

      // Hiển thị thông báo thành công với nhiều thông tin hơn
      message.success({
        content: (
          <div>
            <div
              style={{ fontSize: "16px", fontWeight: "bold", marginBottom: 8 }}
            >
              ✅ Gửi yêu cầu thành công!
            </div>
            <div style={{ fontSize: "13px" }}>
              📋 Yêu cầu của bạn đã được gửi đến Tổ trưởng
            </div>
            <div style={{ fontSize: "13px", marginTop: 4 }}>
              🔄 Đang chuyển về trang "Yêu Cầu Của Tôi"...
            </div>
          </div>
        ),
        duration: 3,
        style: { marginTop: "20vh" },
      });

      // Chờ 1 giây để user đọc thông báo, sau đó chuyển trang
      setTimeout(() => {
        navigate("/citizen/my-requests", {
          state: { refresh: true, timestamp: Date.now() },
        });
      }, 1500);
    } catch (error) {
      console.error("❌ Error submitting request:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error message:", error.response?.data?.message);

      let errorMsg = "Có lỗi xảy ra";

      if (error.response) {
        // Server trả về lỗi
        errorMsg = error.response.data?.message || error.response.statusText;

        if (error.response.status === 401) {
          errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.response.status === 403) {
          errorMsg = "Bạn không có quyền thực hiện thao tác này.";
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        errorMsg =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        // Lỗi khác
        errorMsg = error.message;
      }

      message.error({
        content: `❌ Không thể gửi yêu cầu: ${errorMsg}`,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/citizen/my-requests")}
            >
              Quay lại
            </Button>
          </Space>
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
            <FileTextOutlined /> Gửi Yêu Cầu Chỉnh Sửa
          </Title>
          <Text type="secondary">
            Gửi yêu cầu chỉnh sửa thông tin hộ khẩu/nhân khẩu đến Tổ trưởng
          </Text>
        </div>

        {/* Info Alert */}
        <Alert
          message="Yêu cầu sẽ được gửi đến Tổ trưởng để xem xét và phê duyệt"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />

        {/* Request Form */}
        <Card bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              requestType: "EDIT_INFO",
            }}
          >
            <Form.Item
              name="requestType"
              label="Loại yêu cầu"
              rules={[
                { required: true, message: "Vui lòng chọn loại yêu cầu" },
              ]}
            >
              <Select placeholder="Chọn loại yêu cầu" size="large">
                {requestTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    <Space>
                      {type.icon}
                      {type.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề" },
                { min: 10, message: "Tiêu đề phải có ít nhất 10 ký tự" },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề ngắn gọn cho yêu cầu"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả chi tiết"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả" },
                { min: 20, message: "Mô tả phải có ít nhất 20 ký tự" },
              ]}
            >
              <TextArea
                placeholder="Mô tả chi tiết nội dung cần chỉnh sửa, lý do và các thông tin liên quan"
                rows={6}
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item name="details" label="Nội dung cụ thể (không bắt buộc)">
              <TextArea
                placeholder="Thông tin chi tiết về những gì cần thay đổi (VD: Số điện thoại: 0123456789 → 0987654321)"
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  size="large"
                  loading={loading}
                >
                  Gửi yêu cầu
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate("/citizen/my-requests")}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default SubmitEditRequest;
