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
            newplanYear: null,
            newplanQuarter: null,
            newmax: null,
            newreshall: null,
            newphone: null,
            newemail: null,

        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.onPlanYearValueChange = this.onPlanYearValueChange.bind(this)
        this.onPlanQuarterValueChange = this.onPlanQuarterValueChange.bind(this)
        this.getCustomerHistory = this.getCustomerHistory.bind(this)
        this.displayPlanQuarters = this.displayPlanQuarters.bind(this)
        this.resetNewInfo = this.resetNewInfo.bind(this)
    }

    edit() {
        this.setState({ editing: true });
        this.resetNewInfo();
    }

    save(customer) {
        this.setState({ editing: false });
        //console.log(this.state.newplan)
        let allcustomers = [...this.state.customers];
        let newcustomer = {...this.state.selectedCustomer};
        if (this.state.newplanYear && this.state.newplanQuarter) {
             newcustomer.plan = this.state.newplanYear+this.state.newplanQuarter;
             //console.log('newplanQuarter: ', this.state.newplanQuarter);
             //console.log('newplanYear', this.state.newplanYear)
             firebase.database().ref('/customers/' + customer.id + '/plan').set(newcustomer.plan);
        }
        else if (this.state.newplanYear) {
            newcustomer.plan = this.state.newplanYear+customer.plan.substring(9);
            //console.log('newcustomer.plan: ', newcustomer.plan);
            //console.log('newplanYear', this.state.newplanYear)
            //console.log('customer quarter: ', customer.plan.substring(9));
            firebase.database().ref('/customers/' + customer.id + '/plan').set(newcustomer.plan);
       }
       else if (this.state.newplanQuarter) {
            newcustomer.plan = customer.plan.substring(0,9)+this.state.newplanQuarter;
            //console.log('newcustomer.plan: ', newcustomer.plan);
            //console.log('customer year', customer.plan.substring(0,9))
            //console.log('newplanQuarter: ', this.state.newplanQuarter);
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
    onPlanYearValueChange(value) {
        console.log('newPlanYear: ', value)
        this.setState({ newplanYear: value });
    }
    onPlanQuarterValueChange(value) {
        console.log('newPlanQuarter: ', value)
        this.setState({ newplanQuarter: value });
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
                //console.log(res[1])
                if (res[1] === customer.id) {
                    history.push(childSnapshot.toJSON())
                }
            });
        });
        //console.log(history)
        return history;
    }

    displayPlanQuarters(customerPlan) {
        if (customerPlan) {

            if (customerPlan === 'F') {
                const result = 'Fall Quarter';
                return result;
            }
            else if (customerPlan === 'W') {
                const result = 'Winter Quarter' ;
                return result;
            }
            else if (customerPlan === 'S') {
                const result = 'Spring Quarter' ;
                return result;
            }
            else if (customerPlan === 'F-W-S') {
                const result = 'Full Year' ;
                return result;
            }
        }
    }

    resetNewInfo() {
        this.setState({ newplanYear: null });
        this.setState({ newplanQuarter: null });
        this.setState({ newmax: null });
        this.setState({ newreshall: null });
        this.setState({ newphone: null });
        this.setState({ newemail: null });
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
                const planSelectYear = [
                    {label: '2020-2021', value: '2020-2021'},
                    {label: '2021-2022', value: '2021-2022'},
                    {label: '2022-2023', value: '2022-2023'},
                    {label: '2023-2024', value: '2023-2024'}
                ]
                const planSelectQuarter = [
                    {label: 'Full Year', value: '-F-W-S'},
                    {label: 'Fall Quarter', value: '-F'},
                    {label: 'Winter Quarter', value: '-W'},
                    {label: 'Spring Quarter', value: '-S'},
                ]
                //this.setState({ newplanYear: null });
                //this.setState({ newplanQuarter: null });
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
                                        <Dropdown  value={this.state.newplanYear} options={planSelectYear} onChange={(e) => {this.onPlanYearValueChange(e.target.value);}} placeholder={customer.plan.substring(0,9)}/>
                                        <Dropdown  value={this.state.newplanQuarter} options={planSelectQuarter} onChange={(e) => {this.onPlanQuarterValueChange(e.target.value);}} placeholder={this.displayPlanQuarters(customer.plan.substring(10))}/>
                                        
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

//<InputText type="text" placeholder={customer.plan} onChange={(e) => { this.onPlanValueChange(e.target.value); }}/>
//placeholder={customer.plan.substring(0,9)}
//placeholder={this.displayPlanQuarters(customer.plan.substring(10))}