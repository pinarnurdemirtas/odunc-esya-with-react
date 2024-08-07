import React, { useState } from 'react';
import { Menu, Button, Modal } from 'antd';
import ItemTable from './ItemTable';
import Profile from './Profile';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState(<ItemTable />);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleMenuClick = (key) => {
    switch (key) {
      case 'viewProfile':
        setContent(<Profile />);
        break;
      case 'home':
        setContent(<ItemTable />);
        break;
      default:
        setContent(<ItemTable />);
        break;
    }
  };

  const handleLogoutModalOk = () => {                 //logout islemi icin
    navigate('/components/Login');
    setIsLogoutModalOpen(false);
  };

  const handleLogoutModalCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const showLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  return (
    <div>
      <Menu
        onClick={(e) => handleMenuClick(e.key)}
        mode="horizontal"
        defaultSelectedKeys={['home']}
        style={{ backgroundColor: '#CC99FF' }}
      >
        <Menu.Item
          key="viewProfile"
          style={{
            backgroundColor: '#CC99FF',
            color: '#990099',
            fontWeight: 'bold',
          }}
        >
          Profil
        </Menu.Item>
        <Menu.Item
          key="home"
          style={{
            backgroundColor: '#CC99FF',
            color: '#990099',
            fontWeight: 'bold',
          }}
        >
          Kiralama
        </Menu.Item>
        <Menu.Item style={{ float: 'right' }}>
          <Button
            type="primary"
            style={{
              backgroundColor: '#990099',
              color: '#CC99FF',
              fontWeight: 'bold',
            }}
            onClick={showLogoutModal}
          >
            Çıkış Yap
          </Button>
        </Menu.Item>
      </Menu>
      <Modal                                                                  //LOG OUT MODAL
          title={<span style={{ color: '#990099' }}>Onay</span>}
          visible={isLogoutModalOpen}
          onCancel={handleLogoutModalCancel}
          footer={[
              <Button 
                  key="back" 
                  onClick={handleLogoutModalCancel} 
                  style={{ color: '#990099', marginLeft: '10px', borderColor: '#990099' }}
              >
                  İptal
              </Button>,
              <Button 
                  key="submit" 
                  type="primary" 
                  onClick={handleLogoutModalOk}
                  style={{ backgroundColor: '#FFCCFF', color: '#990099', marginLeft: '10px', borderColor: '#990099' }}
              >
                  Çıkış Yap
              </Button>,
          ]}
      >
          <p style={{ color: '#990099' }}>Çıkış Yapmak istediğinizden emin misiniz?</p>
      </Modal>
      <div>
        {content}
      </div>
    </div>
  );
};

export default Home;
