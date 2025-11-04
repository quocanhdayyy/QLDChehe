import React, { useState } from 'react';
import { Card, Form, Input, Button, DatePicker, InputNumber, message } from 'antd';
import Layout from '../../components/Layout';
import { giftEventService } from '../../services';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const GiftEventCreate = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const [start, end] = values.timeRange;
      const payload = {
        title: values.title,
        description: values.description,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        slotsTotal: values.slotsTotal,
      };
      await giftEventService.create(payload);
      message.success('Tạo sự kiện thành công');
      window.location.href = '/leader/gift-events';
    } catch (err) {
      console.error(err);
      message.error('Không thể tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Card title="Tạo sự kiện phát quà">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Tên sự kiện" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="timeRange" label="Thời gian" rules={[{ required: true }]}>
            <RangePicker showTime />
          </Form.Item>
          <Form.Item name="slotsTotal" label="Số lượng slot" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Tạo</Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};

export default GiftEventCreate;
