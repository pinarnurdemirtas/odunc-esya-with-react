import React from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, KeyOutlined  } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  
  const onFinish = async (values) => {            //giriş işlemi
    const response = await axios.get("https://v1.nocodeapi.com/pnurdemirtas/google_sheets/xZXBeswzziWBwPzh/search", {
      params: {
        tabId: 'users',
        searchKey: 'userName',  //userName e göre veri çek
        searchValue: values.username,
      }
    });

    if (response.data.length !== 0) { //veri çekilemediyse
      if (response.data[0].password === values.password){ //veri çekildi ama parola yanlış
        localStorage.setItem('currentUser', JSON.stringify(response.data[0]));
        message.success('Giriş başarılı!');
        navigate('/components/home');
      } else {
        message.error('Yanlış parola!');
      }
    } else {
      message.error('Geçersiz kullanıcı adı!');
    }
  };

  return (
    <div style={{ backgroundColor: '#990099', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#fff' }}>
      <Title level={1} style={{ color: '#fff', fontSize: '48px', fontWeight: 'bold', textAlign: 'center', fontFamily: 'cursive', marginBottom: '10px' }}>
        ALVER
      </Title>
      <Title level={3} style={{ color: '#fff', textAlign: 'center', marginTop: '0', marginBottom: '20px', fontFamily: 'cursive' }}>
        Kiralayın, Kiraya verin
      </Title>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{ maxWidth: 400, width: '100%' }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Kullanıcı adınızı giriniz!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Kullanıcı Adı" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Şifrenizi giriniz!' }]}
        >
          <Input.Password prefix={<KeyOutlined/>} placeholder="Şifre" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'center' }}>
          <Button
          htmlType="submit" 
          style={{ backgroundColor: '#FFCCFF', borderColor: '#FFFFFF', color: '#990099'}}>
            Giriş Yap
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
