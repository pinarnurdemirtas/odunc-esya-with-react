import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Row, Col, Space, Modal, DatePicker, Form, InputNumber, message } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import ShoppingCart from './ShoppingCart';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const ItemTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isInsertItemModalVisible, setIsInsertItemModalVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [firstDayFilter, setFirstDayFilter] = useState('');
  const [lastDayFilter, setLastDayFilter] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null); //Silinecek kayit
  const [userData, setUserData] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {                 //tabloya verileri apiden çeker
    setIsLoading(true);
    axios({
      method: "get",
      url: "https://v1.nocodeapi.com/pnurdemirtas/google_sheets/xZXBeswzziWBwPzh?tabId=items",
    }).then(function (response) {

      let filteredData = response.data.data;
      console.log(filteredData);
      console.log(searchFilter);

      if (searchFilter !== '' && searchFilter !== null) {
        filteredData = filteredData.filter((d) => d.itemName.toLowerCase().includes(searchFilter));
      }
      if (firstDayFilter !== '' && firstDayFilter !== null) {
        filteredData = filteredData.filter((d) => moment(d.firstDay, 'DD/MM/YYYY').format('DD/MM/YYYY') === firstDayFilter.format("DD/MM/YYYY"));
      }
      if (lastDayFilter !== '' && lastDayFilter !== null) {
        filteredData = filteredData.filter((d) => moment(d.lastDay, 'DD/MM/YYYY').format('DD/MM/YYYY') === lastDayFilter.format("DD/MM/YYYY"));
      }
  
      setCourses(filteredData);
      setIsLoading(false);
    });
  };

  const addToCart = (item) => {                               //sepete ekler
    console.log(item);
    const isItemInCart = items.some(cartItem => cartItem.id === item.id);
    if (isItemInCart) {
      message.error('Ürün zaten sepetinizde!');
      return;
    }
    const newItem = { 
      ...item, 
      cartId: new Date().getTime(), // benzersiz bir cartId
      totalDay: calculateTotalDays(item),
      totalPrice: item.pricePerDay*calculateTotalDays(item) 
    }; 
    setItems([...items, newItem]);
    message.success('Sepete eklendi!');
  };

  
  const insertItemModalOnFinish = async (values) => {                                   //yeni eşya ekler
    const itemId = uuidv4();
    const formattedFirstDay = values.firstDay.format("DD/MM/YYYY");
    const formattedLastDay = values.lastDay.format("DD/MM/YYYY");
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));  //kullanici bilgilerini tutar
    if (currentUser) {
      setUserData(
        {
          ...currentUser,
          birthDate: currentUser.birthDate ? moment(currentUser.birthDate, 'DD-MM-YYYY') : null
        }
      )
    }
    
    console.log(userData)
    const itemData = [
      [
        itemId,
        userData.id,
        userData.name + ' ' + userData.lastName,
        values.itemName,
        formattedFirstDay,
        formattedLastDay,
        values.pricePerDay
      ]
    ];
    
    setIsLoading(true);
    axios.post(
      "https://v1.nocodeapi.com/pnurdemirtas/google_sheets/xZXBeswzziWBwPzh?tabId=items",
      itemData,
    )
    .then(response => {
      console.log("İlan ekleme işlemi başarılı:", response);
      message.success("Yeni ilan eklendi.");
      form.resetFields();
      setIsInsertItemModalVisible(false);
      getData();
    })
    .catch(error => {
      console.error("İlan ekleme işlemi sırasında hata oluştu:", error);
      message.error("İlan eklenirken hata oluştu.");
    });
    setIsLoading(false);
  };
  
  const showInsertItemModal = () => {
    setIsInsertItemModalVisible(true);
  };
  
  const handleInsertModalCancel = () => {
    setIsInsertItemModalVisible(false);
  };

  const handleDeleteClick = (record) => {
    setDeleteRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setDeleteRecord(null);
  };
  
  const handleDeleteOk = () => {  //items tablosundan kayit silme
    setIsLoading(true);
    axios.delete("https://v1.nocodeapi.com/pnurdemirtas/google_sheets/xZXBeswzziWBwPzh", {
      params: {
        tabId: 'items',
        row_id: deleteRecord.row_id,
      }
    })
    .then(response => {
      console.log("Silme işlemi başarılı:", response);
      setIsDeleteModalVisible(false);
      setDeleteRecord(null);
      getData();
    })
    .catch(error => {
      console.error("Silme işlemi sırasında hata oluştu:", error);
    });
    setIsLoading(false);
  };

  const calculateTotalDays = (record) => {                           //toplam günü apide tutmuyoruz da burada hesaplıyoruz
    const firstDay = moment(record.firstDay, 'DD/MM/YYYY');
    const lastDay = moment(record.lastDay, 'DD/MM/YYYY');
    return lastDay.diff(firstDay, 'days') + 1;
  };

  const handleSearchChange = (text) => {                //filtreler için
    setSearchFilter(text.target.value.toLowerCase());
  }
  
  const handleFirstDayChange = (date) => {
    setFirstDayFilter(date);
  };

  const handleLastDayChange = (date) => {
    setLastDayFilter(date);
  };

  const columns = [                    //Tablo sütunları
    {
      title: 'Eşya',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'İlk Gün',
      key: 'firstDay',
      dataIndex: 'firstDay',
      render: (text) => moment(text, 'DD/MM/YYYY').format('DD/MM/YYYY'),
    },
    {
      title: 'Son Gün',
      key: 'lastDay',
      dataIndex: 'lastDay',
      render: (text) => moment(text, 'DD/MM/YYYY').format('DD/MM/YYYY'),
    },
    {
      title: 'Toplam Gün',
      key: 'totalDay',
      render: (_, record) => <span>{calculateTotalDays(record)}</span>,
    },
    {
      title: 'Günlük ücret',
      key: 'pricePerDay',
      dataIndex: 'pricePerDay',
      render: (text) => <span>{parseInt(text, 10)}</span>,
    },
    {
      title: 'Toplam ücret',
      key: 'totalPrice',
      render: (_, record) => {
        const totalDays = calculateTotalDays(record);
        const pricePerDay = parseInt(record.pricePerDay, 10);
        return <span>{totalDays * pricePerDay}</span>;
      },
    },
    {
      title: 'İlan Sahibi',
      key: 'ownerName',
      dataIndex: 'ownerName',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'İşlemler',
      key: 'islem',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => addToCart(record)}
            style={{ backgroundColor: '#CC99FF', borderColor: '#FFCCFF', color: '#990099' }}
          >Sepete ekle</Button>
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            style={{ backgroundColor: '#CC99FF', borderColor: '#FFCCFF', color: '#990099' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: '#CC99FF	', padding: '20px', color: '#fff' }}>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Input                             //filtre alanları
            placeholder="Aradığınız eşya" 
            style={{ width: 400}}
            onChange={handleSearchChange}
          />
          <DatePicker
            placeholder="İlk gün" 
            format="DD/MM/YYYY"
            style={{ marginLeft: '10px' }}
            onChange={handleFirstDayChange}
          />
          <DatePicker
            placeholder="Son gün" 
            format="DD/MM/YYYY"
            style={{ marginLeft: '10px' }}
            onChange={handleLastDayChange}
          />
          <Button 
            onClick={getData} 
            type="primary"
            style={{ backgroundColor: '#FFCCFF', color: '#990099', marginLeft: '10px' }}><SearchOutlined /></Button>
          <Button 
            onClick={showInsertItemModal} 
            type="primary"
            style={{ backgroundColor: '#FFCCFF', color: '#990099', marginLeft: '10px'  }}>Ekle</Button>
          <Modal
            title={<span style={{ color: '#990099' }}>Eşya Ekle</span>}               //EŞYE EKLEME MODALI
            visible={isInsertItemModalVisible}
            onCancel={handleInsertModalCancel}
            footer={null}
          >
            <Form
                name="insertForm"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                form={form}
                onFinish={insertItemModalOnFinish}
                >
                <Form.Item
                    label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Eşya</span>}
                    name="itemName"
                    rules={[{ required: true, message: 'Eşya adı giriniz!' }]}
                    >
                    <Input style={{ width: '70%', color: '#990099', marginLeft: '10px', borderColor: '#990099', backgroundColor: '#FFCCFF' }}/>
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: '#990099', fontWeight: 'bold' }}>İlk gün</span>}
                    name="firstDay"
                    rules={[{ required: true, message: 'İlk günün tarihini seçiniz!' }]}
                    >
                    <DatePicker 
                        picker="day" 
                        format="DD/MM/YY" 
                        style={{ color: '#990099', marginLeft: '10px', borderColor: '#990099', backgroundColor: '#FFCCFF' }}/>
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Son gün</span>}
                    name="lastDay"
                    rules={[{ required: true, message: 'Son günün tarihini seçiniz!' }]}
                    >
                    <DatePicker 
                        picker="day" 
                        format="DD/MM/YY"
                        style={{ color: '#990099', marginLeft: '10px', borderColor: '#990099', backgroundColor: '#FFCCFF' }} />
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: '#990099', fontWeight: 'bold' }}>Günlük Ücret</span>}
                    name="pricePerDay"
                    rules={[{ required: true, message: 'Günlük ücret giriniz!' }]}
                    >
                    <InputNumber style={{ width: '30%', color: '#990099', marginLeft: '10px', borderColor: '#990099', backgroundColor: '#FFCCFF'}}/>
                </Form.Item>
                <Form.Item
                  style={{ textAlign: 'center' }}
                >
                  <Button 
                    onClick={handleInsertModalCancel}
                    style={{ color: '#990099', borderColor: '#990099'}}>
                    İptal
                  </Button>
                  <Button 
                    htmlType="submit"
                    style={{ color: '#990099', marginLeft: '10px', borderColor: '#990099', backgroundColor: '#FFCCFF'}}>
                    Ekle
                  </Button>
                </Form.Item>
            </Form>
          </Modal>
          <Modal                                                              //KAYIT SİLME ONAY MODALI
            title={<span style={{ color: '#990099', fontWeight: 'bold' }}>İlanı silmek istediğinize emin misin?</span>}
            visible={isDeleteModalVisible}
            onOk={handleDeleteOk}
            onCancel={handleDeleteCancel}
            okText="Onayla"
            cancelText="İptal"
            okButtonProps={{ style: { backgroundColor: '#990099', color: '#FFCCFF' } }}
            cancelButtonProps={{ style: { borderColor: '#990099', color: '#990099' } }}
          >
          </Modal>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <ShoppingCart items={items} setItems={setItems}/>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={courses}
        loading={isLoading}
        pagination={false}
        style={{ backgroundColor: '#CC99FF', borderRadius: '8px', marginTop: '20px' }}
      />
    </div>
  );
};

export default ItemTable;
