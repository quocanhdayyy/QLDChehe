import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Typography,
  Space,
  Avatar,
  Divider,
  Spin,
  Alert,
  message,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import { citizenService } from "../../services";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MyHousehold = () => {
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHouseholdData();
  }, []);

  const fetchHouseholdData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cả household và thông tin cá nhân
      const [householdData, citizenData] = await Promise.all([
        citizenService.getMyHousehold(),
        citizenService.getMe().catch(() => null), // Không fail nếu không có citizen info
      ]);

      // Combine data
      const combinedData = {
        ...householdData,
        currentCitizen: citizenData, // Thông tin chủ hộ đang login
      };

      console.log("📊 Household data:", combinedData);
      setHousehold(combinedData);
    } catch (err) {
      console.error("Error fetching household:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải thông tin hộ khẩu";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải thông tin hộ khẩu..." />
        </div>
      </Layout>
    );
  }

  if (error || !household) {
    return (
      <Layout>
        <Alert
          message="Không tìm thấy thông tin hộ khẩu"
          description={
            error ||
            "Bạn chưa được gán vào hộ khẩu nào. Vui lòng liên hệ quản lý để được hỗ trợ."
          }
          type="warning"
          showIcon
        />
      </Layout>
    );
  }

  // Map household data
  const householdInfo = {
    id: household.code || household._id,
    headOfHousehold: household.head?.fullName || "N/A",
    address: household.address
      ? `${household.address.street || ""}, ${household.address.ward || ""}, ${
          household.address.district || ""
        }, ${household.address.city || ""}`.replace(/^,\s*|,\s*,/g, "")
      : "N/A",
    phone: household.phone || "N/A",
    registrationDate: household.createdAt,
    status: household.status,
  };

  // Map members data
  const members = (household.members || []).map((member) => ({
    key: member._id,
    id: member.code || member._id,
    fullName: member.fullName,
    dateOfBirth: member.dateOfBirth,
    gender:
      member.gender === "MALE"
        ? "Nam"
        : member.gender === "FEMALE"
        ? "Nữ"
        : "Khác",
    idCard: member.nationalId,
    relationship: member.relationshipToHead || "N/A",
    phone: member.phone,
  }));

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar
            icon={record.gender === "Nam" ? <ManOutlined /> : <WomanOutlined />}
            style={{
              backgroundColor: record.gender === "Nam" ? "#1890ff" : "#eb2f96",
            }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (
        <Tag color={gender === "Nam" ? "blue" : "pink"}>{gender}</Tag>
      ),
    },
    {
      title: "CCCD/CMND",
      dataIndex: "idCard",
      key: "idCard",
      render: (text) => text || <Tag color="default">Chưa có</Tag>,
    },
    {
      title: "Quan hệ",
      dataIndex: "relationship",
      key: "relationship",
      render: (rel) => <Tag color="purple">{rel}</Tag>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "-",
    },
  ];

  // Thông tin chủ hộ đang login
  const currentCitizen = household.currentCitizen;

  return (
    <Layout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <TeamOutlined /> Hộ Khẩu Của Tôi
          </Title>
        </div>

        {/* Thông tin cá nhân của chủ hộ */}
        {currentCitizen && (
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Thông tin cá nhân</span>
              </Space>
            }
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Họ và tên">
                <Text strong style={{ fontSize: 16 }}>
                  {currentCitizen.fullName}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã nhân khẩu">
                <Tag color="blue">
                  {currentCitizen.code || currentCitizen._id}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {dayjs(currentCitizen.dateOfBirth).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Tag color={currentCitizen.gender === "MALE" ? "blue" : "pink"}>
                  {currentCitizen.gender === "MALE"
                    ? "Nam"
                    : currentCitizen.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="CCCD/CMND">
                {currentCitizen.nationalId || (
                  <Tag color="default">Chưa có</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {currentCitizen.phone || <Tag color="default">Chưa có</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {dayjs(householdInfo.registrationDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò" span={2}>
                <Tag color="gold">Chủ hộ</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Divider />

        {/* Members Table */}
        <Card
          title={
            <Space>
              <TeamOutlined />
              <span>Danh sách thành viên ({members.length})</span>
            </Space>
          }
          bordered={false}
        >
          <Table
            columns={columns}
            dataSource={members}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default MyHousehold;
