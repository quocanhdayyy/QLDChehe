import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  message,
  Upload,
  DatePicker,
  Spin,
} from "antd";
import {
  TrophyOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { citizenService } from "../../services/citizenService";
import { rewardService } from "../../services/rewardService";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SubmitRewardProposal = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingHousehold, setLoadingHousehold] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  const achievementTypes = [
    {
      value: "national",
      label: "Học sinh giỏi cấp quốc gia",
      reward: "1,000,000 VNĐ",
    },
    {
      value: "provincial",
      label: "Học sinh giỏi cấp tỉnh",
      reward: "500,000 VNĐ",
    },
    {
      value: "district",
      label: "Học sinh giỏi cấp trường",
      reward: "300,000 VNĐ",
    },
    {
      value: "excellent",
      label: "Học sinh tiên tiến",
      reward: "200,000 VNĐ",
    },
    { value: "good", label: "Học sinh giỏi", reward: "200,000 VNĐ" },
  ];

  const grades = [
    "Lớp 1",
    "Lớp 2",
    "Lớp 3",
    "Lớp 4",
    "Lớp 5",
    "Lớp 6",
    "Lớp 7",
    "Lớp 8",
    "Lớp 9",
    "Lớp 10",
    "Lớp 11",
    "Lớp 12",
  ];

  // Fetch household members on mount
  useEffect(() => {
    fetchHouseholdMembers();
  }, []);

  const fetchHouseholdMembers = async () => {
    setLoadingHousehold(true);
    try {
      const household = await citizenService.getMyHousehold();
      if (household && household.members) {
        // Filter to show only children or students (age < 25)
        const members = household.members.filter((member) => {
          const age = member.dateOfBirth
            ? new Date().getFullYear() -
              new Date(member.dateOfBirth).getFullYear()
            : 0;
          return age < 25 && member._id; // Only students/children
        });
        setHouseholdMembers(members);
      }
    } catch (error) {
      console.error("Error fetching household:", error);
      message.error("Không thể tải thông tin hộ khẩu");
    } finally {
      setLoadingHousehold(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Get selected achievement type label
      const selectedAchievement = achievementTypes.find(
        (a) => a.value === values.achievementType
      );

      // Create proposal payload
      const proposalData = {
        citizen: values.citizenId,
        title: values.achievementTitle,
        description: `${values.description}\n\nThông tin chi tiết:\n- Trường: ${
          values.school
        }\n- Lớp: ${
          values.grade
        }\n- Ngày đạt thành tích: ${values.achievementDate.format(
          "DD/MM/YYYY"
        )}`,
        criteria: `${selectedAchievement?.label} - ${selectedAchievement?.reward}`,
        evidenceImages: [], // TODO: Handle file upload to get URLs
      };

      await rewardService.proposals.create(proposalData);
      message.success("Gửi đề xuất khen thưởng thành công!");
      form.resetFields();
      setFileList([]);
      navigate("/citizen/my-requests", { state: { refresh: true } });
    } catch (error) {
      console.error("Error submitting proposal:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi đề xuất. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <TrophyOutlined /> Đề Xuất Khen Thưởng
          </Title>
          <Text type="secondary">
            Điền thông tin dưới đây để đề xuất khen thưởng cho học sinh
          </Text>
        </div>

        <Card bordered={false}>
          <Spin spinning={loadingHousehold}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              <Title level={4} style={{ marginBottom: 16 }}>
                Thông tin học sinh
              </Title>

              <Form.Item
                name="citizenId"
                label="Chọn học sinh"
                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
                extra="Chọn thành viên trong hộ khẩu để đề xuất khen thưởng"
              >
                <Select
                  size="large"
                  placeholder="Chọn học sinh từ hộ khẩu"
                  loading={loadingHousehold}
                  onChange={(value) => {
                    const selected = householdMembers.find(
                      (m) => m._id === value
                    );
                    if (selected) {
                      // Auto-fill student name if needed
                      form.setFieldsValue({
                        studentName: selected.fullName,
                      });
                    }
                  }}
                >
                  {householdMembers.map((member) => (
                    <Option key={member._id} value={member._id}>
                      {member.fullName} - {member.citizenID || "Chưa có CCCD"}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="studentName"
                label="Họ và tên học sinh"
                rules={[
                  { required: true, message: "Vui lòng nhập tên học sinh" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập họ và tên đầy đủ"
                  disabled
                />
              </Form.Item>

              <Space style={{ width: "100%", marginBottom: 24 }} size="large">
                <Form.Item
                  name="school"
                  label="Trường"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên trường" },
                  ]}
                  style={{ flex: 1, minWidth: 250 }}
                >
                  <Input size="large" placeholder="Tên trường" />
                </Form.Item>

                <Form.Item
                  name="grade"
                  label="Lớp"
                  rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <Select size="large" placeholder="Chọn lớp">
                    {grades.map((grade) => (
                      <Option key={grade} value={grade}>
                        {grade}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Space>

              <Title level={4} style={{ marginBottom: 16, marginTop: 24 }}>
                Thông tin thành tích
              </Title>

              <Form.Item
                name="achievementType"
                label="Loại thành tích"
                rules={[
                  { required: true, message: "Vui lòng chọn loại thành tích" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Chọn loại thành tích"
                  onChange={(value) => {
                    const selected = achievementTypes.find(
                      (a) => a.value === value
                    );
                    message.info(
                      `Giá trị khen thưởng dự kiến: ${selected?.reward}`
                    );
                  }}
                >
                  {achievementTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label} - {type.reward}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="achievementTitle"
                label="Tiêu đề thành tích"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tiêu đề thành tích",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="VD: Giải Nhất Olympic Toán học"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả chi tiết"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả chi tiết" },
                  { min: 20, message: "Mô tả phải có ít nhất 20 ký tự" },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Mô tả chi tiết về thành tích, giải thưởng đạt được..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                name="achievementDate"
                label="Ngày đạt thành tích"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày đạt thành tích",
                  },
                ]}
              >
                <DatePicker
                  size="large"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>

              <Form.Item
                name="documents"
                label="Tài liệu đính kèm"
                extra="Tải lên giấy khen, bằng khen hoặc các minh chứng liên quan (bắt buộc)"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng tải lên ít nhất 1 minh chứng",
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  maxCount={5}
                  beforeUpload={() => false}
                  accept="image/*,.pdf"
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại liên hệ"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập số điện thoại"
                  addonBefore="+84"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SendOutlined />}
                    loading={loading}
                  >
                    Gửi đề xuất
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
          </Spin>
        </Card>
      </div>
    </Layout>
  );
};

export default SubmitRewardProposal;
