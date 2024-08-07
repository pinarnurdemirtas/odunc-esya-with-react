import React, { useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, InputNumber, message, Drawer, List, Divider } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ShoppingCart = ({ items, setItems }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isKodModalOpen, setIsKodModalOpen] = useState(false);
  const [kodValue, setKodValue] = useState('');
  const [form] = Form.useForm();

  const removeFromCart = (cartId) => {
    setItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };

  const cardInfoHandleOk = async () => {                        //sipariş tamamlama işlemi
    if (kodValue === '') {
      message.error('Lütfen telefon numaranıza gelen kodu girin.');
      return;
    }
    if (kodValue === 123456) {
      console.log(items);
      const deletePromises = items.map(item => (
        axios.delete("https://v1.nocodeapi.com/pnurdemirtas/google_sheets/xZXBeswzziWBwPzh", {
          params: {
            tabId: 'items',
            row_id: item.row_id,
          }
        })
      ));

      await Promise.all(deletePromises)
        .then(responses => {
          console.log("Silme işlemi başarılı:", responses);
          message.success('Siparişiniz alındı, tarafınıza bilgi e-postası gönderilmiştir.');
          setIsKodModalOpen(false);
          setIsCardModalOpen(false);
          setVisible(false);
          
          form.resetFields();
          setKodValue('');
          navigate('/components/Home');
        })
        .catch(error => {
          console.error("Silme işlemi sırasında hata oluştu:", error);
        });
        items.forEach(item => removeFromCart(item.cartId));
        return;
      }
      message.error('Girdiğiniz kod yanlış, lütfen tekrar deneyin!');
    };

  const cardModalHandleCancel = () => {
    setIsCardModalOpen(false);
  };

  const kodModalHandleCancel = () => {
    setIsKodModalOpen(false);
  };

  const cardModalOnFinish = (values) => {
    setIsKodModalOpen(true);
  };

  const handleInputChange = (value) => {
    setKodValue(value);
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const calculateTotalPrice = () => {               //sepett altında toplam tutarı bulmak için
    let totalPrice = 0;
    items.forEach(item => {
      totalPrice += item.totalPrice;
    });
    return totalPrice;
  };

  return (
    <div>
      <div style={{ textAlign: 'right' }}>
        <Button 
          type="primary" 
          onClick={showDrawer} 
          icon={<ShoppingCartOutlined />} 
          style={{ backgroundColor: '#FFCCFF', color: '#990099', marginLeft: '10px' }}>
          Sepet
        </Button>
      </div>
      <Drawer
        title={<span style={{ fontSize: '22px', color: '#990099'}}>Alışveriş Sepeti</span>}
        placement="right"
        closable={false}
        onClose={onClose}
        visible={visible}
      >
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => removeFromCart(item.cartId)} 
                  style={{ color: '#FF0000' }}>
                  <DeleteOutlined style={{ fontSize: '22px' }} />
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<span style={{ fontSize: '18px', color: '#990099'}}>{item.itemName}</span>}
                description={
                  <div>
                    <p>Günlük {item.pricePerDay} TL'den {item.totalDay} gün</p>
                    <h3>{item.totalPrice} TL</h3>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <h3>Toplam Ödenecek Tutar: {calculateTotalPrice()} TL</h3>
          <Button 
            onClick={onClose}
            style={{ backgroundColor: '#FFCCFF', color: '#990099', marginLeft: '10px', marginRight: 8 }}>
            Alışverişe Devam Et
          </Button>
          <Button 
            type="primary" 
            onClick={() => setIsCardModalOpen(true)}
            style={{ backgroundColor: '#990099', color: '#FFCCFF', marginLeft: '10px', marginRight: 22 }}>
            Ödemeye Geç
          </Button>
        </div>
      </Drawer>

      <Modal
        title={<span style={{ color: '#990099', fontWeight: 'bold' }}>Kart Bilgileri</span>}
        visible={isCardModalOpen}
        onCancel={cardModalHandleCancel}
        footer={null}
        okButtonProps={{ style: { backgroundColor: '#990099', color: '#FFCCFF' } }}
        cancelButtonProps={{ style: { borderColor: '#990099', color: '#990099' } }}
      >
        <Form
          form={form}
          name="cardForm"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 15 }}
          onFinish={cardModalOnFinish}
          style={{ maxWidth: 500, 
            width: '100%',
            backgroundColor: '#FFCCFF', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
        >
          <Form.Item
            label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Kart Numarası</span>}
            name="cardNumber"
            rules={[{ required: true, message: 'Kart numaranızı giriniz!' }]}
          >
            <Input style={{ width: '100%' }} maxLength={16} minLength={16} />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Son Kullanma Tarihi</span>}
            name="expirationDate"
            rules={[{ required: true, message: 'Son kullanma tarihini girin!' }]}
          >
            <DatePicker picker="month" format="MM/YY" placeholder="Seçiniz" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#990099', fontWeight: 'bold' }}>CVV</span>}
            name="cvv"
            rules={[{ required: true, message: 'CVV girin!' }]}
          >
            <Input style={{ width: '100%' }} maxLength={3} minLength={3} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ backgroundColor: '#990099', color: '#FFCCFF', marginTop: '20px' }}>
              Kod Gönder
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span style={{ color: '#990099', fontWeight: 'bold' }}>Telefon numaranıza gelen kodu giriniz.</span>}
        visible={isKodModalOpen}
        onOk={cardInfoHandleOk}
        onCancel={kodModalHandleCancel}
        okText="Onayla"
        cancelText="İptal"
        okButtonProps={{ style: { backgroundColor: '#990099', color: '#FFCCFF' } }}
        cancelButtonProps={{ style: { borderColor: '#990099', color: '#990099' } }}
      >
        <InputNumber 
          style={{ backgroundColor: '#FFCCFF', borderColor: '#990099', color: '#990099', marginTop: '20px' }}
          onChange={handleInputChange}
          maxLength={6} 
          minLength={6} 
        />
      </Modal>
    </div>
  );
};

export default ShoppingCart;
