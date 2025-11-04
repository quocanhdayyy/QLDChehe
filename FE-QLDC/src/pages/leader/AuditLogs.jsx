import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Input,
  Space,
  Tag,
  Typography,
  DatePicker,
  Select,
  message,
  Tooltip,
  Modal,
  Descriptions,
  Button,
  Image,
  Badge,
} from "antd";
import {
  SearchOutlined,
  AuditOutlined,
  UserOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import dayjs from "dayjs";
import { auditLogService } from "../../services/auditLogService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch audit logs từ API
  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.current, pagination.pageSize, selectedAction, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      // Thêm filter theo action (chỉ khi có giá trị)
      if (selectedAction && selectedAction !== "") {
        params.action = selectedAction;
      }

      // Thêm filter theo date range
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }

      const response = await auditLogService.getAll(params);

      setLogs(response.docs || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
      });
    } catch (error) {
      message.error("Không thể tải nhật ký hệ thống");
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mapping action types
  const getActionDisplay = (action) => {
    if (action.includes("APPROVED")) {
      return { color: "green", text: "Phê duyệt" };
    } else if (action.includes("REJECTED")) {
      return { color: "red", text: "Từ chối" };
    } else if (action.includes("REQUESTED") || action.includes("PROPOSED")) {
      return { color: "blue", text: "Yêu cầu" };
    } else if (action.includes("UPDATE")) {
      return { color: "orange", text: "Cập nhật" };
    } else if (action.includes("CREATE")) {
      return { color: "cyan", text: "Tạo mới" };
    } else if (action.includes("DELETE")) {
      return { color: "red", text: "Xóa" };
    }
    return { color: "default", text: action };
  };

  // Mapping entity types
  const entityTypeConfig = {
    Citizen: { text: "Nhân khẩu", icon: <UserOutlined /> },
    Household: { text: "Hộ khẩu", icon: <FileTextOutlined /> },
    EditRequest: { text: "Yêu cầu chỉnh sửa", icon: <FileTextOutlined /> },
    RewardProposal: { text: "Đề xuất khen thưởng", icon: <AuditOutlined /> },
    User: { text: "Người dùng", icon: <UserOutlined /> },
    Notification: { text: "Thông báo", icon: <InfoCircleOutlined /> },
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 80,
      align: "center",
      render: (_, __, index) => (
        <Text strong style={{ color: "#1890ff" }}>
          #{(pagination.current - 1) * pagination.pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (text) => (
        <div>
          <div>{dayjs(text).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(text).format("HH:mm:ss")}
          </Text>
        </div>
      ),
    },
    {
      title: "Người thực hiện",
      dataIndex: "performedBy",
      key: "performedBy",
      width: 180,
      render: (user) => (
        <Space>
          <UserOutlined />
          <Text>{user?.username || user?.fullName || "Hệ thống"}</Text>
        </Space>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 130,
      align: "center",
      render: (action) => {
        const config = getActionDisplay(action);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Loại đối tượng",
      dataIndex: "entityType",
      key: "entityType",
      width: 200,
      render: (type) => {
        const config = entityTypeConfig[type] || { text: type, icon: null };
        return (
          <Space>
            {config.icon}
            <Text>{config.text}</Text>
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Tìm kiếm theo người thực hiện
  const filteredLogs = logs.filter((log) => {
    if (!searchText) return true;

    const searchLower = searchText.toLowerCase();
    // Tìm kiếm theo username hoặc fullName của người thực hiện
    const username = log.performedBy?.username?.toLowerCase() || "";
    const fullName = log.performedBy?.fullName?.toLowerCase() || "";
    return username.includes(searchLower) || fullName.includes(searchLower);
  });

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedAction("");
    setDateRange(null);
    setPagination({ ...pagination, current: 1 });
  };

  // Đếm số lượng filter đang active
  const activeFilterCount = [searchText, selectedAction, dateRange].filter(
    Boolean
  ).length;

  const renderDetailContent = () => {
    if (!selectedLog) return null;

    const { before, after, proposedChanges, reason, evidenceImages } =
      selectedLog;

    return (
      <div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Hành động">
            {getActionDisplay(selectedLog.action).text}
          </Descriptions.Item>
          <Descriptions.Item label="Loại yêu cầu">
            {entityTypeConfig[selectedLog.entityType]?.text ||
              selectedLog.entityType}
          </Descriptions.Item>
          <Descriptions.Item label="Người thực hiện">
            {selectedLog.performedBy?.fullName ||
              selectedLog.performedBy?.username ||
              "Hệ thống"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian">
            {dayjs(selectedLog.createdAt).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>
          {reason && (
            <Descriptions.Item label="Lý do">
              <Text>{reason}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Hiển thị proposedChanges cho EditRequest */}
        {selectedLog.entityType === "EditRequest" && before && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>
              Thông tin thay đổi đề xuất:
            </Title>
            <Descriptions bordered column={1} size="small">
              {before.title && (
                <Descriptions.Item label="Tiêu đề">
                  {before.title}
                </Descriptions.Item>
              )}
              {before.description && (
                <Descriptions.Item label="Mô tả">
                  {before.description}
                </Descriptions.Item>
              )}
              {before.details && (
                <Descriptions.Item label="Chi tiết">
                  {before.details}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Hiển thị proposedChanges cho RewardProposal */}
        {selectedLog.entityType === "RewardProposal" && before && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>
              Thông tin đề xuất khen thưởng:
            </Title>
            <Descriptions bordered column={1} size="small">
              {before.studentName && (
                <Descriptions.Item label="Tên học sinh">
                  {before.studentName}
                </Descriptions.Item>
              )}
              {before.school && (
                <Descriptions.Item label="Trường">
                  {before.school}
                </Descriptions.Item>
              )}
              {before.grade && (
                <Descriptions.Item label="Lớp">
                  {before.grade}
                </Descriptions.Item>
              )}
              {before.achievementType && (
                <Descriptions.Item label="Loại thành tích">
                  {before.achievementType}
                </Descriptions.Item>
              )}
              {before.achievementTitle && (
                <Descriptions.Item label="Tiêu đề thành tích">
                  {before.achievementTitle}
                </Descriptions.Item>
              )}
              {before.description && (
                <Descriptions.Item label="Mô tả">
                  {before.description}
                </Descriptions.Item>
              )}
              {before.achievementDate && (
                <Descriptions.Item label="Ngày đạt thành tích">
                  {dayjs(before.achievementDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
              )}
              {before.phone && (
                <Descriptions.Item label="Số điện thoại">
                  {before.phone}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Hiển thị before/after cho Citizen updates */}
        {selectedLog.entityType === "Citizen" && (before || after) && (
          <>
            {before && (
              <>
                <Title level={5} style={{ marginTop: 16 }}>
                  Trước khi thay đổi:
                </Title>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 12,
                    borderRadius: 4,
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(before, null, 2)}
                </pre>
              </>
            )}
            {after && (
              <>
                <Title level={5} style={{ marginTop: 16 }}>
                  Sau khi thay đổi:
                </Title>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 12,
                    borderRadius: 4,
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(after, null, 2)}
                </pre>
              </>
            )}
          </>
        )}

        {/* Hiển thị evidence images */}
        {evidenceImages && evidenceImages.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>
              Hình ảnh minh chứng:
            </Title>
            <Image.PreviewGroup>
              {evidenceImages.map((img, idx) => (
                <Image
                  key={idx}
                  width={100}
                  src={img}
                  style={{ marginRight: 8 }}
                />
              ))}
            </Image.PreviewGroup>
          </>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <Space
            style={{ width: "100%", justifyContent: "space-between" }}
            align="center"
          >
            <div>
              <Title level={2} style={{ marginBottom: 8 }}>
                <AuditOutlined /> Nhật Ký Hệ Thống
              </Title>
              {activeFilterCount > 0 && (
                <Text type="secondary">
                  <Badge count={activeFilterCount} style={{ marginRight: 8 }} />
                  Đang áp dụng {activeFilterCount} bộ lọc
                </Text>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                type="default"
              >
                Xóa bộ lọc
              </Button>
            )}
          </Space>
        </div>

        <Card bordered={false} style={{ marginBottom: 16 }}>
          {/* Hiển thị active filters */}
          {activeFilterCount > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Text strong>Bộ lọc đang áp dụng:</Text>
                {searchText && (
                  <Tag closable onClose={() => setSearchText("")} color="blue">
                    Người thực hiện: {searchText}
                  </Tag>
                )}
                {selectedAction && (
                  <Tag
                    closable
                    onClose={() => setSelectedAction("")}
                    color="orange"
                  >
                    Hành động: {selectedAction}
                  </Tag>
                )}
                {dateRange && (
                  <Tag
                    closable
                    onClose={() => setDateRange(null)}
                    color="purple"
                  >
                    Từ {dayjs(dateRange[0]).format("DD/MM/YYYY")} đến{" "}
                    {dayjs(dateRange[1]).format("DD/MM/YYYY")}
                  </Tag>
                )}
              </Space>
            </div>
          )}

          <Space wrap style={{ width: "100%" }}>
            <Input
              placeholder="Tìm kiếm theo người thực hiện..."
              prefix={<SearchOutlined />}
              style={{ width: 280 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Select
              placeholder="Chọn hành động"
              style={{ width: 220 }}
              value={selectedAction || undefined}
              onChange={setSelectedAction}
              allowClear
            >
              <Option value="EDIT_REQUEST_CREATED">
                📝 Tạo yêu cầu chỉnh sửa
              </Option>
              <Option value="CITIZEN_UPDATE_APPROVED">
                ✅ Phê duyệt chỉnh sửa
              </Option>
              <Option value="CITIZEN_UPDATE_REJECTED">
                ❌ Từ chối chỉnh sửa
              </Option>
              <Option value="REWARD_PROPOSAL_CREATED">
                🎯 Tạo đề xuất khen thưởng
              </Option>
              <Option value="REWARD_APPROVED">✅ Phê duyệt khen thưởng</Option>
              <Option value="REWARD_REJECTED">❌ Từ chối khen thưởng</Option>
            </Select>

            <RangePicker
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Space>
        </Card>

        <Card bordered={false}>
          {searchText && (
            <div style={{ marginBottom: 16 }}>
              <Text>
                Tìm thấy <strong>{filteredLogs.length}</strong> kết quả cho
                người thực hiện chứa "{searchText}"
              </Text>
            </div>
          )}
          <Table
            columns={columns}
            dataSource={filteredLogs}
            loading={loading}
            rowKey={(record) => record._id || record.id}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: searchText ? filteredLogs.length : pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bản ghi`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
          />
        </Card>

        {/* Modal hiển thị chi tiết */}
        <Modal
          title={
            <Space>
              <InfoCircleOutlined />
              <span>Chi tiết Nhật ký</span>
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setDetailModalVisible(false)}
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {renderDetailContent()}
        </Modal>
      </div>
    </Layout>
  );
};

export default AuditLogs;
