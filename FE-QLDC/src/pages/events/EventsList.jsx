import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Popconfirm, Tooltip, Tag } from 'antd';
import Layout from '../../components/Layout';
import { giftEventService } from '../../services';
import { Link, useNavigate } from 'react-router-dom';

const EventsList = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Only open events
      const res = await giftEventService.getAll({ status: 'OPEN' });
      const docs = res.docs || res;
      setEvents(docs);
    } catch (err) {
      console.error(err);
      message.error('Không tải được danh sách sự kiện');
    } finally { setLoading(false); }
  };

  const handleRegister = async (id) => {
    try {
      setLoading(true);
      const res = await giftEventService.register(id);
      if (res && res.registration) {
        message.success('Đăng ký thành công');
        navigate('/events/my-registrations');
      } else {
        message.error(res.message || 'Không thể đăng ký');
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data || err.message;
      // map backend reasons to friendly messages
      const reason = typeof serverMsg === 'string' ? serverMsg : (err.response?.data?.reason || '');
      let friendly = 'Đăng ký thất bại';
      if (reason === 'ALREADY_REGISTERED' || serverMsg === 'ALREADY_REGISTERED') friendly = 'Bạn đã đăng ký sự kiện này';
      else if (reason === 'EVENT_FULL_OR_CLOSED' || serverMsg === 'EVENT_FULL_OR_CLOSED') friendly = 'Sự kiện đã hết slot hoặc đã đóng';
      else if (reason === 'AGE_TOO_YOUNG') friendly = 'Bạn chưa đủ điều kiện độ tuổi để tham gia';
      else if (reason === 'NOT_IN_AREA') friendly = 'Bạn không thuộc khu vực được phép tham gia';
      else if (reason === 'AGE_INFO_MISSING') friendly = 'Thông tin ngày sinh thiếu, không thể kiểm tra điều kiện';
      else if (serverMsg && typeof serverMsg === 'string') friendly = serverMsg;
      message.error(friendly);
    } finally { setLoading(false); }
  };

  const columns = [
    { title: 'Tên', dataIndex: 'title', key: 'title' },
    { title: 'Thời gian', key: 'time', render: (_, r) => `${new Date(r.startDate).toLocaleString()} → ${new Date(r.endDate).toLocaleString()}` },
    { title: 'Slots còn lại', dataIndex: 'slotsRemaining', key: 'slotsRemaining', render: (v) => (
      v <= 0 ? <Tag color="red">Hết</Tag> : v <= 5 ? <Tag color="orange">Sắp hết ({v})</Tag> : <span>{v}</span>
    ) },
    { title: 'Hành động', key: 'action', render: (_, record) => (
      <Space>
        <Link to={`/leader/gift-events/${record._id}`}>Xem</Link>
        <Popconfirm
          title="Xác nhận đăng ký?"
          onConfirm={() => handleRegister(record._id)}
          okText="Đăng ký"
          cancelText="Hủy"
        >
          <Tooltip title={record.slotsRemaining <= 0 ? 'Đã hết slot' : ''}>
            <Button type="primary" disabled={record.slotsRemaining <= 0}>Đăng ký</Button>
          </Tooltip>
        </Popconfirm>
      </Space>
    ) },
  ];

  return (
    <Layout>
      <Card title="Sự kiện phát quà">
        <Table rowKey="_id" dataSource={events} columns={columns} loading={loading} />
      </Card>
    </Layout>
  );
};

export default EventsList;
