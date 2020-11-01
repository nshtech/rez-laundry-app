import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { Chart } from 'primereact/chart'
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';
import {InputTextarea} from 'primereact/inputtextarea';
import {Messages} from 'primereact/messages';
import {Message} from 'primereact/message';

import firebase from 'firebase/app';
import 'firebase/database';

import validator from 'validator'


import customerData from '../customers.json';
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class AddCustomers extends Component {

    constructor() {
        super();
        this.state = {
            customers: [],
            orders: [],
            selectedCustomer: null,
            editing: false,
            idcount: null,
            newfirstname: null,
            newlastname: null,
            newplanYear: null,
            newplanQuarter: null,
            newmax: null,
            newreshall: null,
            newphone: null,
            newemail: null,
            planSelectYear: [
                {label: '2020-2021', value: '2020-2021'},
                {label: '2021-2022', value: '2021-2022'},
                {label: '2022-2023', value: '2022-2023'},
                {label: '2023-2024', value: '2023-2024'}
            ],
            planSelectQuarter: [
                {label: 'Full Year', value: '-F-W-S'},
                {label: 'Winter/Spring Quarter', value: '-W-S'},
                {label: 'Fall Quarter', value: '-F'},
                {label: 'Winter Quarter', value: '-W'},
                {label: 'Spring Quarter', value: '-S'},
            ],
            planSelectWeight: [
                {label: '15 lb/week', value: '15'},
                {label: '20 lb/week', value: '20'},
                {label: '25 lb/week', value: '25'},
            ],
            planSelectReshall:[
                {label: 'Choose later', value: 'Choose later'},
                {label: '560 Lincoln', value: '560 Lincoln'},
                {label: '720 Emerson', value: '720 Emerson'},
                {label: '1838 Chicago', value: '1838 Chicago'},
                {label: '1856 Orrington', value: '1856 Orrington'},
                {label: '2303 Sheridan', value: '2303 Sheridan'},
                {label: 'AYers', value: 'Ayers'},
                {label: 'Allison', value: 'Allison'},
                {label: 'Bobb', value: 'Bobb'},
                {label: 'Chapin', value: 'Chapin'},
                {label: 'East Fairchild', value: 'East Fairchild'},
                {label: 'Elder', value: 'Elder'},
                {label: 'West Fairchild', value: 'West Fairchild'},
                {label: 'Foster-Walker (PLEX)', value: 'Foster-Walker (PLEX)'},
                {label: 'Goodrich', value: 'Goodrich'},
                {label: 'Hobart', value: 'Hobart'},
                {label: 'Jones', value: 'Jones'},
                {label: 'Kemper', value: 'Kemper'},
                {label: 'McCulloch', value: 'McCulloch'},
                {label: 'PARC (North Mid Quads)', value: 'PARC (North Mid Quads)'},
                {label: 'Rogers House', value: 'Rogers House'},
                {label: 'Sargent', value: 'Sargent'},
                {label: 'Shepard Residential College (South Mid Quads)', value: 'Shepard Residential College (South Mid Quads)'},
                {label: 'Shepard Hall', value: 'Shepard Hall'},
                {label: 'Slivka', value: 'Slivka'},
                {label: 'Willard', value: 'Willard'},
                {label: 'Delta Gamma', value: 'Delta Gamma'},
                {label: 'Kappa Kappa Gamma', value: 'Kappa Kappa Gamma'}

            ],

        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.onPlanYearValueChange = this.onPlanYearValueChange.bind(this)
        this.onPlanQuarterValueChange = this.onPlanQuarterValueChange.bind(this)
        //this.getCustomerHistory = this.getCustomerHistory.bind(this)
        this.displayPlanQuarters = this.displayPlanQuarters.bind(this)
        this.resetNewInfo = this.resetNewInfo.bind(this)
        this.addCustomer = this.addCustomer.bind(this)
        this.padId = this.padId.bind(this)
    }


    padId(idNum) {
        var digitLength = (idNum.toString()).length;
        if (digitLength === 1) {
            var result = '0000'+idNum;
        }
        else if (digitLength === 2) {
            var result = '000'+idNum;
        }
        else if (digitLength === 3) {
            var result = '00'+idNum;
        }
        else if (digitLength === 4) {
            var result = '0'+idNum;
        }
        else if (digitLength === 5) {
            var result = idNum.toString();
        }
        return result;

    }
    edit() {
        this.setState({ editing: true });
        //this.resetNewInfo();
    }

    save(customer) {
        this.setState({ editing: false });
        //console.log(this.state.newplan)
        let allcustomers = [...this.state.customers];
        let newcustomer = {...this.state.selectedCustomer};
        if (this.state.newplanyear && this.state.newplanquarter) {
             newcustomer.plan = this.state.newplanyear+this.state.newplanquarter;
             //console.log('newplanQuarter: ', this.state.newplanQuarter);
             //console.log('newplanYear', this.state.newplanYear)
             firebase.database().ref('/customers/' + customer.id + '/plan').set(newcustomer.plan);
        }
        else if (this.state.newplanyear) {
            newcustomer.plan = this.state.newplanyear+customer.plan.substring(9);
            //console.log('newcustomer.plan: ', newcustomer.plan);
            //console.log('newplanYear', this.state.newplanYear)
            //console.log('customer quarter: ', customer.plan.substring(9));
            firebase.database().ref('/customers/' + customer.id + '/plan').set(newcustomer.plan);
       }
       else if (this.state.newplanquarter) {
            newcustomer.plan = customer.plan.substring(0,9)+this.state.newplanquarter;
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
    onFirstNameValueChange(value) {
        //console.log('new first name: ', value)
        this.setState({newfirstname: value});
        
    }
    onLastNameValueChange(value) {
        //console.log('new last name: ', value)
        this.setState({newlastname: value});
    }

    onPlanYearValueChange(value) {
        //console.log('newPlanYear: ', value)
        this.setState({ newplanyear: value });
    }
    onPlanQuarterValueChange(value) {
        //console.log('newPlanQuarter: ', value)
        this.setState({ newplanquarter: value });
    }
    onMaxweightValueChange(value) {
        this.setState({ newmax: value });
    }
    onReshallValueChange(value) {
        this.setState({ newreshall: value });
    }
    onPhoneValueChange(value) {
        if(value[3] ==='-' && value[7]==='-' && value.length===12) {
            this.setState({ newphone: value });
        }
        //this.setState({ newphone: value });
    }
    onEmailValueChange(value) {
        if (value.includes('@') && value.includes('.')) {
            this.setState({ newemail: value });
        }
    }
    resetNewInfo() {
        this.setState({newfirstname: ''});
        this.setState({newlastname: ''});
        this.setState({ newplanyear: '' });
        this.setState({ newplanquarter: ''});
        this.setState({ newmax: '' });
        this.setState({ newreshall: '' });
        this.setState({ newphone: '' });
        this.setState({ newemail: '' });
    }

    addCustomer() {
        //console.log('new first name: ', this.state.newfirstname);
        //console.log('new last name: ', this.state.newlastname);
        // console.log('new plan year: ', this.state.newplanyear);
        // console.log('new plan quarter: ', this.state.newplanquarter);
        // console.log('new max weight: ', this.state.newmax);
        // console.log('new res hall: ', this.state.newreshall);
        // console.log('new phone: ', this.state.newphone);
        // console.log('new email: ', this.state.newemail);
        //this.setState({idcount: this.state.idcount+1});
        //console.log('updated id Count', this.state.idcount);
        if(this.state.newfirstname !=='' && this.state.newlastname !== '' && this.state.newemail !=='' && this.state.newphone !== '' && this.state.newreshall!=='' && this.state.newmax!=='' && this.state.newplanyear!==null && this.state.newplanquarter !== null) {
            
            var idNum = this.padId(this.state.idcount);
            var id = this.state.newfirstname.substring(0,1).toLowerCase() +this.state.newlastname.substring(0,1).toLowerCase()+idNum;
            //console.log('NEW ID: ', id);
            this.messages.show({severity: 'success', summary: 'Success', detail: 'Customer Added!'});
            const db = firebase.database().ref()
            //updating id count in firebase and then updating state variable
            db.child('/idcount').set(this.state.idcount+1);
            db.child('/idcount').once('value')
                .then(snapshot => {
                    this.setState({idcount: snapshot.val()})
                    console.log('state var idcount: ', this.state.idcount);
                    //idNum = snapshot.val();
                    console.log('id from firebase: ', snapshot.val());
                });

            const fullname = this.state.newfirstname + ' ' + this.state.newlastname;
            const email = this.state.newemail
            const phone = this.state.newphone
            const reshall = this.state.newreshall
            const maxweight = this.state.newmax
            const plan = this.state.newplanyear+this.state.newplanquarter
            db.child('/customers/'+id).once("value")
                .then(snapshot => {
                    if(!snapshot.val()) {
                        db.child('/customers/'+id+'/activestatus').set("active");
                        db.child('/customers/'+id+'/bag-condition').set("good");
                        db.child('/customers/'+id+'/bag-missing').set("false");
                        db.child('/customers/'+id+'/detergent').set('unscented');
                        db.child('/customers/'+id+'/email').set(email);
                        db.child('/customers/'+id+'/fabric_softener').set('No');
                        db.child('/customers/'+id+'/id').set(id);
                        db.child('/customers/'+id+'/last_status_updated').set('N/A');
                        db.child('/customers/'+id+'/last_weight_updated').set('N/A');
                        db.child('/customers/'+id+'/laundrystatus').set('out-of-service');
                        db.child('/customers/'+id+'/maxweight').set(maxweight);
                        db.child('/customers/'+id+'/name').set(fullname);
                        db.child('/customers/'+id+'/phone').set(phone);
                        db.child('/customers/'+id+'/plan').set(plan);
                        db.child('/customers/'+id+'/reshall').set(reshall);
                        db.child('/customers/'+id+'/weekweight').set("N/A");
                        db.child('/customers/'+id+'/weightstatus').set("N/A");

                    }
                })

            this.setState({newfirstname: ''});
            this.setState({newlastname: ''});
            this.setState({ newplanyear: ''});
            this.setState({ newplanquarter: '' });
            this.setState({ newmax: '' });
            this.setState({ newreshall: '' });
            this.setState({ newphone: '' });
            this.setState({ newemail: '' });
            //const curr  = await this.resetNewInfo();
       
            //console.log('reset info: ', this.state.newfirstname);
            //document.getElementById("form").reset();
        }
        else {
            this.messages.show({severity: "error", summary: "Missing Fields", detail: "Please enter all information"});
        }

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
            else if (customerPlan === 'W-S') {
                const result = 'Winter/Spring Quarter' ;
                return result;
            }
            else if (customerPlan === 'F-W-S') {
                const result = 'Full Year' ;
                return result;
            }
        }
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
        //var idNum = 0;
        firebase.database().ref('/idcount').once('value')
            .then(snapshot => {
                this.setState({idcount: snapshot.val()})
                console.log('state var idcount: ', this.state.idcount);
                //idNum = snapshot.val();
                console.log('id from firebase: ', snapshot.val());
            });
        //console.log('var idNum: ', idNum);
        //this.setState({idcount: idNum});
    }

    render() {
            var header = <div style={{ textAlign: 'left' }}></div>
            var customer = this.state.selectedCustomer
            //var history = this.getCustomerHistory(customer)
            var laundryStatusDisplay = {
                'picked-up': 'picked up',
                'delivered-to-SH': 'delivered to SH',
                'delivered-to-dorm': 'delivered to dorm',
                'out-of-service': 'out of service',
                'bag-missing': 'bag missing'
            }

            return (
            <div className="card" id="form">
                <h1>Add New Customer</h1>


                <div className="p-fluid p-formgrid p-grid">
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="firstname6">First Name</label>
        <InputText value={this.state.newfirstname} id="firstname" type="text" onChange={(e) => { this.onFirstNameValueChange(e.target.value); }}/>
    </div>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="lastname6">Last Name</label>
        <InputText value={this.state.newlastname} id="lastname" type="text" onChange={(e) => { this.onLastNameValueChange(e.target.value); }}/>
    </div>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="firstname6">Email</label>
        <InputText value={this.state.newemail} id="newemail" type="text" onChange={(e) => { this.onEmailValueChange(e.target.value); }}/>
    </div>
    <div className="p-field p-col-12 p-md-6">
        <label htmlFor="firstname6">Phone</label>
        <InputText value={this.state.newphone} id="newphone" type="text" onChange={(e) => { this.onPhoneValueChange(e.target.value); }}/>
    </div>
    <div className="p-field p-col-12 p-md-3">
        <label htmlFor="address">Laundry Plan Year</label>
        <Dropdown  value={this.state.newplanyear} options={this.state.planSelectYear} onChange={(e) => {this.onPlanYearValueChange(e.target.value);}} placeholder='Select School Year'/>

    </div>
    <div className="p-field p-col-12 p-md-3">
        <label htmlFor="lastname6">Laundry Plan Quarter(s)</label>
        <Dropdown  value={this.state.newplanquarter} options={this.state.planSelectQuarter} onChange={(e) => {this.onPlanQuarterValueChange(e.target.value);}} placeholder='Select Quarter(s)'/>

    </div>
    <div className="p-field p-col-12 p-md-3">
        <label htmlFor="city">Maximum Weight/week</label>
        <Dropdown  value={this.state.newmax} options={this.state.planSelectWeight} onChange={(e) => {this.onMaxweightValueChange(e.target.value);}} placeholder='Select Weight'/>

    </div>
    <div className="p-field p-col-12 p-md-3">
        <label htmlFor="state">Residence Hall</label>
        <Dropdown  value={this.state.newreshall} options={this.state.planSelectReshall} onChange={(e) => {this.onReshallValueChange(e.target.value);}} placeholder='Select Residence Hall'/>
    </div>
    <div className = "p-field p-col-12">
    <Button type="button" style={{ color: 'white', backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginTop: 30 }} label="ADD CUSTOMER" onClick={() => {this.addCustomer()}} />
    </div>
    <div className = "p-field p-col-12">
    <Messages ref={(el) => this.messages = el}></Messages>
    </div>


</div>
</div>
            );




    }
}
