import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Modal } from 'antd';
import Layout from '../../components/Layout';
import { giftEventService } from '../../services';

const MyRegistrations = () => {
  const [loading, setLoading] = useState(false);
  const [regs, setRegs] = useState([]);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => { fetchRegs(); }, []);

  const fetchRegs = async () => {
    setLoading(true);
    try {
      const res = await giftEventService.getMyRegistrations();
      const docs = res.docs || res;
      setRegs(docs);
    } catch (err) {
      console.error(err);
      message.error('Không tải được đăng ký của bạn');
    } finally { setLoading(false); }
  };

  const showQr = (code) => {
    setQrCode(code);
    setQrVisible(true);
  };

  const columns = [
    { title: 'Sự kiện', dataIndex: ['event','title'], key: 'event' },
    { title: 'Đăng ký lúc', dataIndex: 'registeredAt', key: 'registeredAt', render: (v) => v ? new Date(v).toLocaleString() : '' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'QR', dataIndex: 'qrCode', key: 'qrCode', render: (v) => (
      <Button onClick={() => showQr(v)}>{v ? 'Hiển thị QR' : '-'}</Button>
    ) },
  ];

  return (
    <Layout>
      <Card title="Đăng ký của tôi">
        <Table rowKey="_id" dataSource={regs} columns={columns} loading={loading} />
      </Card>

      <Modal visible={qrVisible} footer={null} onCancel={() => setQrVisible(false)} title="Mã QR">
        {qrCode ? (
          <div style={{ textAlign: 'center' }}>
            <img src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(qrCode)}`} alt="QR Code" />
            <div style={{ marginTop: 12, marginBottom: 8, wordBreak: 'break-all' }}>{qrCode}</div>
            <Space>
              <Button onClick={() => setQrVisible(false)}>Đóng</Button>
            </Space>
          </div>
        ) : (
          <div>Không có mã QR</div>
        )}
      </Modal>
    </Layout>
  );
};

export default MyRegistrations;
