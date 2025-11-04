import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message } from 'antd';
import Layout from '../../components/Layout';
import { giftEventService } from '../../services';
import { useParams } from 'react-router-dom';

const GiftRegistrations = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [regs, setRegs] = useState([]);

  useEffect(() => { fetchRegs(); }, []);

  const fetchRegs = async () => {
    setLoading(true);
    try {
      const res = await giftEventService.getRegistrations(id);
      setRegs(res.docs || res);
    } catch (err) {
      console.error(err);
      message.error('Không tải được danh sách đăng ký');
    } finally { setLoading(false); }
  };

  const exportCsv = async () => {
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

  const columns = [
    { title: 'Họ tên', dataIndex: ['citizen','fullName'], key: 'fullName' },
    { title: 'Thời gian đăng ký', dataIndex: 'registeredAt', key: 'registeredAt', render: (v) => v ? new Date(v).toLocaleString() : '' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'QR', dataIndex: 'qrCode', key: 'qrCode' },
  ];

  return (
    <Layout>
      <Card title={`Danh sách đăng ký - sự kiện ${id}`} extra={<Button onClick={exportCsv}>Xuất CSV</Button>}>
        <Table rowKey="_id" dataSource={regs} columns={columns} loading={loading} />
      </Card>
    </Layout>
  );
};

export default GiftRegistrations;
