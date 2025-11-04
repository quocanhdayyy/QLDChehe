import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Button, Space, message, Modal } from 'antd';
import QRCode from 'qrcode';
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

  // draw QR on modal open/change
  useDrawQr(qrCode);

  const downloadQr = () => {
    try {
      const canvas = document.getElementById('qr-canvas');
      if (!canvas) return message.error('Không tìm thấy QR để tải xuống');
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr_${Date.now()}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download QR failed', err);
      message.error('Không thể tải xuống QR');
    }
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
            <canvas id="qr-canvas" style={{ maxWidth: '100%' }} />
            <div style={{ marginTop: 12, marginBottom: 8, wordBreak: 'break-all' }}>{qrCode}</div>
            <Space>
              <Button type="primary" onClick={downloadQr}>Tải xuống</Button>
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

// draw QR to canvas when qrCode changes
function useDrawQr(qrCode) {
  useEffect(() => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas || !qrCode) return;
    QRCode.toCanvas(canvas, qrCode, { width: 300, margin: 2 }).catch((err) => {
      console.error('QR draw failed', err);
    });
  }, [qrCode]);
}

export default MyRegistrations;
