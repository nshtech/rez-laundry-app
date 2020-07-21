import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { Chart } from 'primereact/chart'
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';

import firebase from 'firebase/app';
import 'firebase/database';

import validator from 'validator'


import customerData from '../customers.json';
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class CustomerSearch extends Component {

    constructor() {
        super();
        this.state = {
            customers: [],
            orders: [],
            selectedCustomer: null,
            editing: false,
            newplan: null,
            newmax: null,
            newreshall: null,
            newphone: null,
            newemail: null
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.onPlanValueChange = this.onPlanValueChange.bind(this)
        this.getCustomerHistory = this.getCustomerHistory.bind(this)
    }

    edit() {
        this.setState({ editing: true });
    }

    save(customer) {
        this.setState({ editing: false });
        console.log(this.state.newplan)
        let allcustomers = [...this.state.customers];
        let newcustomer = {...this.state.selectedCustomer};
        if (this.state.newplan) {
             newcustomer.plan = this.state.newplan;
             firebase.database().ref('/customers/' + customer.id + '/plan').set(newcustomer.plan);
        }
        if (this.state.newmax) {
            newcustomer.maxweight = this.state.newmax;
            firebase.database().ref('/customers/' + customer.id + '/maxweight').set(newcustomer.maxweight);
       }
        if (this.state.newreshall) {
            newcustomer.reshall = this.state.newreshall;
            firebase.database().ref('/customers/' + customer.id + '/reshall').set(newcustomer.reshall);
        }
        if (this.state.newphone) {
            newcustomer.phone = this.state.newphone;
            firebase.database().ref('/customers/' + customer.id + '/phone').set(newcustomer.phone);
        }
        if (this.state.newemail) {
            newcustomer.email = this.state.newemail;
            firebase.database().ref('/customers/' + customer.id + '/email').set(newcustomer.email)
        }
        let count = 0;
        let individual=null;
        allcustomers.map(each => {
            if (newcustomer.id == each.id) {
                individual = {...allcustomers[count]};
                individual= newcustomer;
                allcustomers[count] = individual;
            }
            count = count+1
        })
        this.setState({ customers: allcustomers });
        this.setState({selectedCustomer: newcustomer});
        
    }

    //CUSTOMER INFORMATION EDITING
    onPlanValueChange(value) {
        this.setState({ newplan: value });
    }
    onMaxweightValueChange(value) {
        this.setState({ newmax: value });
    }
    onReshallValueChange(value) {
        this.setState({ newreshall: value });
    }
    onPhoneValueChange(value) {
        if(value[3] ==='-' && value.length===12) {
            this.setState({ newphone: value });
        }
    }
    onEmailValueChange(value) {
        this.setState({ newemail: value });
    }

    getCustomerHistory(customer) {
        var history = []
        firebase.database().ref('/orders').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var cid = childSnapshot.key;
                var res = cid.split('-');
                console.log(res[1])
                if (res[1] === customer.id) {
                    history.push(childSnapshot.toJSON())
                }
            });
        });
        console.log(history)
        return history;
    }

    /* --------------- Filters ---------------- */
    componentDidMount() {
        const customerArray = [];
        firebase.database().ref('/customers').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
            });
        });
        this.setState({ customers: customerArray });
        const orderArray = [];
        firebase.database().ref('/orders').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                orderArray.push(childSnapshot.toJSON());
            });
        });
        this.setState({ orders: orderArray });
    }

    render() {
        if (this.state.selectedCustomer) {
            var header = <div style={{ textAlign: 'left' }}></div>
            var customer = this.state.selectedCustomer
            var history = this.getCustomerHistory(customer)
            var laundryStatusDisplay = {
                'picked-up': 'picked up',
                'delivered-to-SH': 'delivered to SH',
                'delivered-to-dorm': 'delivered to dorm',
                'out-of-service': 'out of service',
                'bag-missing': 'bag missing'
            }

            if (this.state.editing) {
                return (
                <div style={{ display: 'flex' }}>
                    <div className="card card-search">
                        <DataTable value={this.state.customers} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} selectionMode="single"
                            responsive={true} autoLayout={true} selection={this.state.selectedCustomer} onSelectionChange={e => this.setState({ selectedCustomer: e.value })}>
                            <Column field="id" header="ID" sortable={true} />
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                        </DataTable>
                    </div>
                    <div className="card card-list">
                        <h1>{customer.name}</h1>
                        <div style={{ display: 'flex' }}>
                            <p className={customer.laundrystatus} style={{ marginRight: 15 }}>{laundryStatusDisplay[customer.laundrystatus]}</p>
                            <p className={customer.weightstatus}>{customer.weightstatus}</p>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ minWidth: '50%' }}>
                                <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.25em' }}>Account Information</h3>
                                <p style={{ marginBlockStart: 0, marginBlockEnd: '1em', paddingRight: 15 }}>Customer ID: {customer.id}</p>
                                <div className="p-field p-grid">
                                    <label htmlFor="firstname3" className="p-col-fixed" style={{ width: '110px' }}>Laundry Plan:</label>
                                    <div className="p-col">
                                        <InputText type="text" placeholder={customer.plan} onChange={(e) => { this.onPlanValueChange(e.target.value); }}/>
                                    </div>
                                </div>
                                <div className="p-field p-grid">
                                    <label htmlFor="lastname3" className="p-col-fixed" style={{ width: '110px' }}>Max Weight:</label>
                                    <div className="p-col">
                                        <InputText type="text" placeholder={customer.maxweight} onChange={(e) => { this.onMaxweightValueChange(e.target.value); }}/>
                                    </div>
                                </div>
                            </div>
                            <div style={{ minWidth: '50%' }}>
                                <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.25em' }}>Contact Information</h3>
                                <div className="p-field p-grid">
                                    <label htmlFor="firstname3" className="p-col-fixed" style={{ width: '120px' }}>Residential Hall:</label>
                                    <div className="p-col">
                                        <InputText type="text" placeholder={customer.reshall} onChange={(e) => { this.onReshallValueChange(e.target.value); }}/>
                                    </div>
                                </div>
                                <div className="p-field p-grid">
                                    <label htmlFor="lastname3" className="p-col-fixed" style={{ width: '120px' }}>Email:</label>
                                    <div className="p-col">
                                        <InputText type="text" placeholder={customer.email} onChange={(e) => { this.onEmailValueChange(e.target.value); }}/>
                                    </div>
                                </div>
                                <div className="p-field p-grid">
                                    <label htmlFor="lastname3" className="p-col-fixed" style={{ width: '120px' }}>Phone:</label>
                                    <div className="p-col">
                                        <InputText type="text" placeholder={customer.phone} onChange={(e) => { this.onPhoneValueChange(e.target.value); }}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button type="button" style={{ color: 'white', backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginTop: 30 }} icon="pi pi-save" iconPos="left" label="SAVE" onClick={() => {this.save(customer)}}>
                        </Button>
                    </div>
                </div>
                );
            } else {
                return (
                    <div style={{display: 'flex'}}>
                        <div className="card card-search">
                            <DataTable value={this.state.customers} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} selectionMode="single"
                                responsive={true} autoLayout={true} selection={this.state.selectedCustomer} onSelectionChange={e => this.setState({ selectedCustomer: e.value })}>
                                <Column field="id" header="ID" sortable={true} filter filterPlaceholder="Search id"/>
                                <Column field="name" header="Name" sortable filter filterPlaceholder="Search name" />
                            </DataTable>
                        </div>
                        <div className="card card-list">
                            <h1>{customer.name}</h1>
                            <div style={{ display: 'flex' }}>
                                <p className={customer.laundrystatus} style={{ marginRight: 15 }}>{laundryStatusDisplay[customer.laundrystatus]}</p>
                                <p className={customer.weightstatus}>{customer.weightstatus}</p>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ minWidth: '50%'  }}>
                                    <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.25em' }}>Account Information</h3>
                                    <p style={{ marginBlockStart: 0, marginBlockEnd: '0.25em', paddingRight: 15 }}>Customer ID: {customer.id}</p>
                                    <p style={{ marginBlockStart: 0, marginBlockEnd: '0.25em', paddingRight: 15 }}>Laundry Plan: {customer.plan}</p>
                                    <p style={{ marginBlockStart: 0, marginBlockEnd: '0.25em', paddingRight: 15 }}>Max Weight: {customer.maxweight}</p>
                                </div>
                                <div style={{ minWidth: '50%' }}>
                                    <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.25em' }}>Contact Information</h3>
                                    <p style={{ marginBlockStart: 0, marginBlockEnd: '0.25em', paddingRight: 15 }}>Residential Hall: {customer.reshall}</p>
                                    <p style={{ marginBlockStart: 0, marginBlockEnd: '0.25em', paddingRight: 15 }}>Email: {customer.email}</p>
                                    <p style={{ marginBlockStart: 0, marginBlockEnd: '0.25em', paddingRight: 15 }}>Phone: {customer.phone}</p>
                                </div>
                            </div>
                            <Button type="button" style={{ color: 'white', backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginTop: 30 }} icon="pi pi-pencil" iconPos="left" label="EDIT" onClick={this.edit}>
                            </Button>
                            {/* <h3 style={{ marginBlockStart: '1em', marginBlockEnd: 0 }}>Bag Weight History</h3> */}
                            {/* <Chart type="line" data={data} /> */}
                            {/* <Editor style={{ height: '320px' }} value={this.state.text} onTextChange={(e) => this.setState({ text: e.htmlValue })} /> */}
                        </div>
                    </div>
                );
            }
        } else {
            var header = <div style={{ textAlign: 'left' }}>
            </div>;
    
            return (
                <div style={{ display: 'flex' }}>
                    <div className="card card-search">
                        <DataTable value={this.state.customers} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} selectionMode="single"
                        responsive={true} autoLayout={true} selection={this.state.selectedCustomer} onSelectionChange={e => this.setState({ selectedCustomer: e.value })}>
                            <Column field="id" header="ID" sortable={true} filter filterPlaceholder="Search id"/>
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search name" />
                        </DataTable>
                    </div>
                    <div className="card card-list">
                        <h1>Select a Customer</h1>
                    </div>
                </div>
            );
        }

    
    }
}