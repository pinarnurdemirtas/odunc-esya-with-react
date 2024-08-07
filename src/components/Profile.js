import React, { useEffect } from 'react';
import { Form, Input, Button, DatePicker, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const Profile = () => {
  const [form] = Form.useForm();  //forma veri getirmek için
  
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));  //kullanıcı bilgilerini tutar
    if (currentUser) {
      const userData = {
        ...currentUser,
        birthDate: currentUser.birthDate ? moment(currentUser.birthDate, 'DD-MM-YYYY') : null
      };
      form.setFieldsValue(userData);
      console.log(currentUser);
    } else {
      message.error('Kullanıcı bilgileri bulunamadı.');
    }
  }, [form]);

  const onFinish = async (values) => {                        //profil güncelleme işlemi
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const updatedUser = {
        name: values.name,
        lastName: values.lastName,
        address: values.address,
        birthDate: values.birthDate ? values.birthDate.format('DD-MM-YYYY') : null,
        mail: values.mail,
        row_id: currentUser.row_id
      };
      
      console.log(updatedUser);
  
      const response = await axios({
        method: "put",
        url: `https://v1.nocodeapi.com/pnurdemirtas/google_sheets/xZXBeswzziWBwPzh`,
        params: {
          tabId: 'users',
        },
        data: {
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          address: updatedUser.address,
          birthDate: updatedUser.birthDate,
          mail: updatedUser.mail,
          row_id: updatedUser.row_id
        }
      });
  
      console.log('Profil güncellendi:', response.data);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      message.success('Profil güncellendi!');
    } catch (error) {
      message.error('Profil güncellenirken hata oluştu!');
      console.error('Profil güncellenirken hata oluştu!', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', height: '100vh', backgroundColor: '#CC99FF'}}>
      <Form
        form={form}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 20 }}
        style={{marginTop: '50px'}}
        onFinish={onFinish}
      >
        <Form.Item
          label={<span style={{ color: '#990099', fontWeight: 'bold' }}>İsim</span>}
          name="name"
          rules={[{ required: true, message: 'İsim alanı boş geçilemez!' }]}
        >
          <Input style={{ backgroundColor: '#FFCCFF', color: '#990099', borderColor: '#990099', width: '250px' }} />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Soyisim</span>}
          name="lastName"
          rules={[{ required: true, message: 'Soyisim alanı boş geçilemez!' }]}
        >
          <Input style={{ backgroundColor: '#FFCCFF', color: '#990099', borderColor: '#990099', width: '250px' }} />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Adres</span>}
          name="address"
          rules={[{ required: true, message: 'Adres alanı boş geçilemez!' }]}
        >
          <Input style={{ backgroundColor: '#FFCCFF', color: '#990099', borderColor: '#990099', width: '250px' }} />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Doğum tarihi</span>}
          name="birthDate"
          rules={[{ required: true, message: 'Doğum tarihi alanı boş geçilemez!' }]}
        >
          <DatePicker format="DD-MM-YYYY" style={{ backgroundColor: '#FFCCFF', color: '#990099', borderColor: '#990099', width: '250px' }} />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Mail</span>}
          name="mail"
          rules={[{ required: true, message: 'Mail alanı boş geçilemez!' }]}
        >
          <Input style={{ backgroundColor: '#FFCCFF', color: '#990099', borderColor: '#990099', width: '250px' }} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 11, span: 30 }}>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: '#990099', color: '#FFCCFF', marginLeft: '10px'}}>
            Bilgileri Güncelle
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
