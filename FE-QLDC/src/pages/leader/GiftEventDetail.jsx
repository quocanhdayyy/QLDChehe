import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Descriptions, message, Popconfirm } from 'antd';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { giftEventService } from '../../services';
import dayjs from 'dayjs';

const GiftEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await giftEventService.getById(id);
      setEvent(res);
    } catch (err) {
      console.error(err);
      message.error('Không tải được thông tin sự kiện');
    } finally { setLoading(false); }
  };

  const handleOpen = async () => {
    try {
      await giftEventService.open(id);
      message.success('Mở sự kiện thành công');
      fetchEvent();
    } catch (err) {
      console.error(err);
      message.error('Không thể mở sự kiện');
    }
  };

  const handleClose = async () => {
    try {
      await giftEventService.close(id);
      message.success('Đóng sự kiện thành công');
      fetchEvent();
    } catch (err) {
      console.error(err);
      message.error('Không thể đóng sự kiện');
    }
  };

  const handleDelete = async () => {
    try {
      await giftEventService.delete(id);
      message.success('Xóa sự kiện thành công');
      navigate('/leader/gift-events');
    } catch (err) {
      console.error(err);
      message.error('Không thể xóa sự kiện');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await giftEventService.exportRegistrationsCsv(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      message.error('Không thể xuất CSV');
    }
  };

  if (!event) {
    return (
      <Layout>
        <Card loading={loading}>Đang tải...</Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card
        title={event.title}
        extra={
          <Space>
            <Link to={`/leader/gift-events/${id}/registrations`}>
              <Button>Danh sách đăng ký</Button>
            </Link>
            <Button onClick={handleExport}>Xuất CSV</Button>
            {event.status !== 'OPEN' && <Button onClick={handleOpen}>Mở</Button>}
            {event.status === 'OPEN' && <Button onClick={handleClose}>Đóng</Button>}
            <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={handleDelete} okText="Xóa" cancelText="Hủy">
              <Button danger> Xóa </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Mô tả">{event.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="Thời gian">{dayjs(event.startDate).format('YYYY-MM-DD HH:mm')} → {dayjs(event.endDate).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="Slots tổng">{event.slotsTotal}</Descriptions.Item>
          <Descriptions.Item label="Slots còn lại">{event.slotsRemaining}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{event.status}</Descriptions.Item>
          <Descriptions.Item label="Điều kiện">{event.conditions ? JSON.stringify(event.conditions) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Tạo bởi">{event.createdBy?.fullName || event.createdBy?.username || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Layout>
  );
};

export default GiftEventDetail;
