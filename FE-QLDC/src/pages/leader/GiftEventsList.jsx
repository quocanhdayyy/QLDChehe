import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message } from 'antd';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { giftEventService } from '../../services';

const GiftEventsList = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await giftEventService.getAll({});
      setEvents(res.docs || res);
    } catch (err) {
      console.error(err);
      message.error('Không tải được danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Tên sự kiện', dataIndex: 'title', key: 'title' },
    {
      title: 'Thời gian',
      key: 'time',
      render: (text, record) => (`${new Date(record.startDate).toLocaleString()} → ${new Date(record.endDate).toLocaleString()}`),
    },
    { title: 'Slots còn lại', dataIndex: 'slotsRemaining', key: 'slotsRemaining' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Link to={`/leader/gift-events/${record._id}`}>Xem</Link>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Card title="Quản lý Sự kiện - Phát quà" extra={<Link to="/leader/gift-events/create"><Button type="primary">Thêm sự kiện</Button></Link>}>
        <Table rowKey="_id" dataSource={events} columns={columns} loading={loading} />
      </Card>
    </Layout>
  );
};

export default GiftEventsList;
