import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Row,
  Col,
  Layout,
  Space,
  Divider,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  SafetyOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔹 Thêm ref cho các phần để điều hướng cuộn
  const heroRef = useRef(null);
  const featureRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: <HomeOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      title: "Quản lý hộ khẩu",
      description:
        "Theo dõi và quản lý thông tin hộ khẩu, nhân khẩu một cách dễ dàng",
    },
    {
      icon: <UserOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
      title: "Quản lý công dân",
      description: "Cập nhật thông tin công dân, tạm trú, tạm vắng",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: "#722ed1" }} />,
      title: "Yêu cầu chỉnh sửa",
      description: "Gửi và theo dõi các yêu cầu chỉnh sửa thông tin",
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 48, color: "#faad14" }} />,
      title: "Khen thưởng",
      description: "Quản lý khen thưởng cho học sinh và sự kiện đặc biệt",
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      const isLeader = user.role === "TO_TRUONG";
      navigate(isLeader ? "/leader/dashboard" : "/citizen/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header */}
      <Header
        style={{
          position: "fixed",
          zIndex: 1000,
          width: "100%",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "0 50px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space size="middle">
            <SafetyOutlined style={{ fontSize: 28, color: "#1890ff" }} />
            <Title
              level={4}
              style={{
                color: "#1f1f1f",
                margin: 0,
                fontWeight: "bold",
              }}
            >
              QUẢN LÝ DÂN CƯ
            </Title>
          </Space>
          <Space size="large">
            <Button
              type="link"
              style={{
                color: "#1f1f1f",
                fontWeight: "500",
                fontSize: 16,
                transition: "all 0.3s ease",
              }}
              onClick={() => scrollToSection(heroRef)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.color = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.color = "#1f1f1f";
              }}
            >
              Trang chủ
            </Button>

            <Button
              type="link"
              style={{
                color: "#1f1f1f",
                fontWeight: "500",
                fontSize: 16,
                transition: "all 0.3s ease",
              }}
              onClick={() => scrollToSection(featureRef)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.color = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.color = "#1f1f1f";
              }}
            >
              Giới thiệu
            </Button>

            <Button
              type="link"
              style={{
                color: "#1f1f1f",
                fontWeight: "500",
                fontSize: 16,
                transition: "all 0.3s ease",
              }}
              onClick={() => scrollToSection(contactRef)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.color = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.color = "#1f1f1f";
              }}
            >
              Liên hệ
            </Button>

            <Button
              type="primary"
              onClick={() => navigate("/login")}
              style={{
                transition: "all 0.3s ease",
                fontWeight: "bold",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 12px rgba(24, 144, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Đăng nhập
            </Button>
          </Space>
        </div>
      </Header>

      {/* Hero Section */}
      <Content ref={heroRef} style={{ marginTop: 64 }}>
        <div
          style={{
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 120,
          }}
        >
          <div style={{ textAlign: "center", paddingBottom: 60 }}>
            <SafetyOutlined style={{ fontSize: 100, color: "#1890ff" }} />
            <Title
              level={1}
              style={{
                color: "#1f1f1f",
                fontSize: 56,
                fontWeight: "bold",
                marginBottom: 12,
              }}
            >
              HỆ THỐNG QUẢN LÝ DÂN CƯ
            </Title>
            <Paragraph
              style={{
                color: "#4f4f4f",
                fontSize: 18,
                maxWidth: 700,
                margin: "0 auto 40px",
                lineHeight: 1.8,
              }}
            >
              Giải pháp hiện đại, toàn diện cho quản lý hộ khẩu, nhân khẩu và
              khen thưởng. Mang đến sự tiện lợi và hiệu quả cho cộng đồng.
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={handleGetStarted}
                style={{
                  height: 50,
                  padding: "0 40px",
                  fontSize: 16,
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 12px rgba(24, 144, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {user ? "Vào Hệ Thống" : "Bắt Đầu Ngay"}
              </Button>

              <Button
                size="large"
                style={{
                  height: 50,
                  padding: "0 40px",
                  fontSize: 16,
                  color: "#1890ff",
                  borderColor: "#1890ff",
                  background: "white",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 12px rgba(24, 144, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Tìm Hiểu Thêm
              </Button>
            </Space>
          </div>

          {/* Banner ảnh có hiệu ứng hover */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "350px",
              overflow: "hidden",
              borderTop: "1px solid #f0f0f0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {[
              "https://sf-static.upanhlaylink.com/img/image_202510284b86a8f5f949dd9205083569a9fdcf65.jpg",
              "https://sf-static.upanhlaylink.com/img/image_20251028b2bb7e707290d92f4439eaf14d472e5f.jpg",
              "https://sf-static.upanhlaylink.com/img/image_202510286583d56a83611bc5a7cc8332600d089b.jpg",
              "https://sf-static.upanhlaylink.com/img/image_20251028428b51d13cbd12c0c5588b8de5f5e37c.jpg",
            ].map((src, i) => (
              <div
                key={i}
                style={{
                  width: "25%",
                  overflow: "hidden",
                  position: "relative",
                  borderRight: i < 3 ? "1px solid #e8e8e8" : "none",
                  transition: "all 0.4s ease",
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  img.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  img.style.transform = "scale(1)";
                }}
              >
                <img
                  src={src}
                  alt={`banner${i}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Features */}
          <div ref={featureRef} style={{ maxWidth: "1400px", width: "100%", padding: "80px 40px" }}>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card
                    hoverable
                    style={{
                      textAlign: "center",
                      height: "100%",
                      border: "1px solid #e0e0e0",
                      borderRadius: 16,
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      background: "#fff",
                    }}
                    bodyStyle={{ padding: "40px 24px" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                    <Title level={4} style={{ marginBottom: 12, fontWeight: "bold" }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: "#595959", fontSize: 15, lineHeight: 1.6 }}>
                      {feature.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer
        ref={contactRef}
        style={{
          background: "#fafafa",
          padding: "64px 50px 24px",
          borderTop: "1px solid #e8e8e8",
          marginTop: 100,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Row gutter={[48, 32]}>
            <Col xs={24} md={8}>
              <Space direction="vertical" size="middle">
                <Space size="middle">
                  <SafetyOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                  <Title level={4} style={{ color: "#1f1f1f", margin: 0 }}>
                    QUẢN LÝ DÂN CƯ
                  </Title>
                </Space>
                <Paragraph style={{ color: "#555" }}>
                  Hệ thống quản lý dân cư hiện đại, giúp tổ chức và quản lý thông tin hộ khẩu, nhân khẩu hiệu quả.
                </Paragraph>
              </Space>
            </Col>
            <Col xs={24} md={9}>
  <Title level={5} style={{ color: "#1f1f1f", marginBottom: 16 }}>
    Liên Hệ
  </Title>
  <Space direction="vertical" size="middle">
    <Space>
      <EnvironmentOutlined style={{ color: "#1890ff", fontSize: 26 }} />
      <Text style={{ color: "#333", fontSize: 15 }}>
        Phường 1, Quận 1, TP.HCM
      </Text>
    </Space>
    <Space>
      <PhoneOutlined style={{ color: "#1890ff", fontSize: 26 }} />
      <Text style={{ color: "#333", fontSize: 15 }}>0123 456 789</Text>
    </Space>
    <Space>
      <MailOutlined style={{ color: "#1890ff", fontSize: 26 }} />
      <Text style={{ color: "#333", fontSize: 15 }}>contact@qldc.vn</Text>
    </Space>
  </Space>
</Col>

            <Col xs={24} md={6} style={{ textAlign: "left" }}>
  <Title level={5} style={{ color: "#1f1f1f", marginBottom: 16 }}>
    Theo Dõi Chúng Tôi
  </Title>
  <Space
    direction="vertical"
    size="middle"
    style={{ alignItems: "flex-start", width: "100%" }}
  >
    <Space>
      <FacebookOutlined style={{ fontSize: 26, color: "#1890ff" }} />
      <Text style={{ color: "#333", fontSize: 15 }}>
        Facebook: /QuanLyDanCu
      </Text>
    </Space>
    <Space>
      <TwitterOutlined style={{ fontSize: 26, color: "#1890ff" }} />
      <Text style={{ color: "#333", fontSize: 15 }}>
        Twitter: @QLDanCu
      </Text>
    </Space>
    <Space>
      <LinkedinOutlined style={{ fontSize: 26, color: "#1890ff" }} />
      <Text style={{ color: "#333", fontSize: 15 }}>
        LinkedIn: /company/quanlydancu
      </Text>
    </Space>
  </Space>
</Col>

          </Row>
          <Divider />
          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#888" }}>
              © 2024 Hệ Thống Quản Lý Dân Cư. All rights reserved.
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default HomePage;
