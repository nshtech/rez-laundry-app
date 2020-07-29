import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext';

import firebase from 'firebase/app';
import 'firebase/database';

import validator from 'validator'


import customerData from '../customers.json';
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class BagTracker extends Component {

    constructor() {
        super();
        this.state = {
            customers: [],
            selectedActive: 'active',
            selectedStatus: null,
            editing: false,
            loading: true,
            selectedCustomers: null
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.export = this.export.bind(this);
        this.onActiveFilterChange = this.onActiveFilterChange.bind(this);
        this.onStatusFilterChange = this.onStatusFilterChange.bind(this);
        this.bagStatusEditor = this.bagStatusEditor.bind(this)
        this.displaySelection = this.displaySelection.bind(this)
        this.loadInitialState = this.loadInitialState.bind(this)
        this.generalEditor = this.generalEditor.bind(this);



    }
    export() {
        this.dt.exportCSV();
    }

    /* --------------- Editing ---------------- */
    edit() {
        this.setState({ editing: true });
    }

    save() {
        this.setState({ editing: false });
    }


    updateWeightStatus(props,value, currDate) {

        if (value > props.rowData.maxweight) {
            firebase.database().ref('/customers/' + props.rowData.id + '/'+'weightstatus').set('overweight')
            let updatedCustomers = [...props.value];
            updatedCustomers[props.rowIndex][props.field] = value;
            updatedCustomers[props.rowIndex]['weightstatus'] = 'overweight';
            this.setState({ customers: updatedCustomers });
            return value
        }
        else {
            firebase.database().ref('/customers/' + props.rowData.id + '/'+'weightstatus').set('underweight')
            let updatedCustomers = [...props.value];
            updatedCustomers[props.rowIndex][props.field] = value;
            updatedCustomers[props.rowIndex]['weightstatus'] = 'underweight';
            this.setState({ customers: updatedCustomers });
            return value
        }
    }

    async onEditorValueChange(props, value) {

        firebase.database().ref('/customers/' + props.rowData.id + '/' + props.field).set(value)
        const db = firebase.database().ref();
        var currWeight = value;
        var currDay = new Date().getDate();
        var currMonth = new Date().getMonth() +1;
        var currYear = new Date().getFullYear();
        var currDate = currMonth + '-'+currDay+'-'+currYear;
        var fullDate = new Date().toDateString();
        var currTime = new Date().toLocaleTimeString('it-IT');
        db.child('/orders/' + currDate + props.rowData.id).once("value")
            .then(snapshot => {
                if (!snapshot.val()) {
                    db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id).set(0)
                    db.child('/orders/' + currDate +' '+currTime+' - '+props.rowData.id + '/weight').set(currWeight);
                    db.child('/orders/' + currDate+' '+currTime+' - ' + props.rowData.id + '/maxweight').set(props.rowData.maxweight);
                    db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/id').set(props.rowData.id);
                    db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/laundrystatus').set(props.rowData.laundrystatus);
                    db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/weightstatus').set(props.rowData.weightstatus);
                }
                db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/date').set(currDate+' '+ currTime);
                db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/weight').set(currWeight);
                db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/maxweight').set(props.rowData.maxweight);
                db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/id').set(props.rowData.id);
                db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/laundrystatus').set(props.rowData.laundrystatus);
                db.child('/orders/' + currDate +' '+currTime+' - '+ props.rowData.id + '/weightstatus').set(props.rowData.weightstatus);

            })
        firebase.database().ref('/customers/' + props.rowData.id + '/last_updated').set(currDate + ' ' + currTime)
        const curr = await this.updateWeightStatus(props,value, currDate);
    }

    inputTextEditor(props, field) {
        return <InputText type="text" value={props.rowData[field]} style={{ maxWidth: 100 }} onChange={(e) => { this.onEditorValueChange(props, e.target.value);}}/>
    }

    generalEditor(props) {
        return this.inputTextEditor(props, ' ');
    }

    onEditorValueChange2(value) {
        var query = firebase.database().ref("customers").orderByKey();
        query.once("value")
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var key = childSnapshot.key;
                    firebase.database().ref('/customers/' + key + '/' + "laundrystatus").set("bag-missing")
                });
        });
    }

    bagStatusEditor(allcustomers, currentcustomers, newstatus) {
        let updatedCustomers = [...allcustomers];
        const db = firebase.database().ref()
        var currDay = new Date().getDate();
        var currMonth = new Date().getMonth() +1;
        var currYear = new Date().getFullYear();
        var currDate = currMonth + '-'+currDay+'-'+currYear;
        //var currDate = new Date().toDateString();
        var currTime = new Date().toLocaleTimeString('it-IT');

        if (currentcustomers) {
            var ids = Object.keys(currentcustomers).map(function (key) {
                return currentcustomers[key].id;
            });
            updatedCustomers.map(each => {
                if (ids.includes(each.id)) {
                    each.laundrystatus = newstatus;
                    if (newstatus == 'out-of-service') {
                        each.weightstatus = 'N/A'
                        each.weekweight = 'N/A'
                        db.child('/customers/'+each.id+'/weekweight').set('N/A');
                        db.child('/customers/'+each.id+'/weightstatus').set('N/A');
                    }
                    db.child('/orders/' + currDate + each.id).once("value")
                        .then(snapshot => {
                            if (!snapshot.val()) {
                                db.child('/orders/' + currDate +' '+currTime+' - '+ each.id).set(0)
                                db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/weight').set(each.weekweight);
                                db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/maxweight').set(each.maxweight);
                                db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/id').set(each.id);
                                db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/laundrystatus').set(each.laundrystatus);
                                db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/weightstatus').set(each.weightstatus);
                            }
                            db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/date').set(currDate+' '+ currTime);
                            db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/weight').set(each.weekweight);
                            db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/maxweight').set(each.maxweight);
                            db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/id').set(each.id);
                            db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/laundrystatus').set(each.laundrystatus);
                            db.child('/orders/' + currDate +' '+currTime+' - '+ each.id + '/weightstatus').set(each.weightstatus);

                        })

                }
            })
            this.setState({ customers: updatedCustomers });
        }
        this.dothisfirst(currentcustomers, newstatus)

    }


    dothisfirst(currentcustomers, newstatus) {
        if (currentcustomers) {
            var ids = Object.keys(currentcustomers).map(function (key) {
                return currentcustomers[key].id;
            });
            console.log(ids)
            var query = firebase.database().ref("customers").orderByKey();
            query.once("value")
                .then(function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        if (ids.includes(key)) {
                            var key = childSnapshot.key;
                            firebase.database().ref('/customers/' + key + '/' + "laundrystatus").set(newstatus)

                        }
                    });
                });
        }
        return currentcustomers
    }


    displaySelection(data) {
        if (this.state.editing && (!data || data.length === 0)) {
            return <div style={{ textAlign: 'left' }}>No Selection</div>;
        }
    }


    /* --------------- Filters ---------------- */
    statusBodyTemplate(rowData) {
        var laundryStatusDisplay = {
            'picked-up': 'picked up',
            'delivered-to-SH': 'delivered to SH',
            'delivered-to-dorm': 'delivered to dorm',
            'out-of-service': 'out of service',
            'bag-missing': 'bag missing'
        }
        return <span className={rowData.laundrystatus}>{laundryStatusDisplay[rowData.laundrystatus]}</span>
    }
    weightBodyTemplate(rowData) {
        return <span className={rowData.weightstatus}>{rowData.weightstatus}</span>;
    }

    activeBodyTemplate(rowData) {
        return <span className={rowData.activestatus}>{rowData.activestatus}</span>;
    }

    renderStatusFilter() {
        var statuses = [
            { label: 'Picked Up', value: 'picked-up' },
            { label: 'Out of Service', value: 'out-of-service' },
            { label: 'Delivered to SH', value: 'delivered-to-SH' },
            { label: 'Delivered to Dorm', value: 'delivered-to-dorm' },
            { label: 'Bag Missing', value: 'bag-missing' }
        ];

        return (

            <Dropdown value={this.state.selectedStatus} options={statuses} onChange={this.onStatusFilterChange}
             showClear={true} placeholder="Select a Status" className="p-column-filter" style={{maxWidth: 200, minWidth: 50}} />
        );
    }


    onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({ selectedStatus: event.value });
    }
    renderActiveFilter() {

        var actives = [
            { label: 'active', value: 'active' },
            { label: 'inactive', value: 'inactive' }

        ];

        return (

        <Button label="Remove Inactive" onClick={this.onActiveFilterChange}/>

       );

  }

    onActiveFilterChange(event) {
        this.dt.filter('active', 'activestatus', 'equals');
    }

    loadInitialState = async () => {
        const customerArray = [];
        firebase.database().ref('/customers').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                if (childSnapshot.val().activestatus === 'active' ) {
                    customerArray.push(childSnapshot.toJSON());
                }
                
            });
        });
        this.setState({ customers: customerArray });
        this.setState({ loading: false });

    }

    componentWillMount() {
        this.loadInitialState()
    }

    render() {
        const statusFilter = this.renderStatusFilter();
        const activeFilter = this.renderActiveFilter();
        const allcustomers = this.state.customers;
        const currentcustomers = this.state.selectedCustomers;

        /* --------------- RETURN ---------------- */
        /* ---------------- edit mode ------------*/
        if (this.state.editing) {
            var header = <div style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 10 }}>
                    <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
                    </Button>
                    <Button type="button" style={{ color: 'white', backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="SAVE" onClick={this.save}>
                    </Button>
                </div>
                <div>
                    <Button type="button" style={{ color: '#23547B', backgroundColor: '#B3E5FC', borderColor: '#23547B', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="PICKED UP" onClick={() => { this.bagStatusEditor(allcustomers, currentcustomers, 'picked-up')}}>
                    </Button>
                    <Button type="button" style={{ color: '#694382', backgroundColor: '#ECCFFF', borderColor: '#694382', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="SH" onClick={() => { this.bagStatusEditor(allcustomers, currentcustomers, 'delivered-to-SH') }}>
                    </Button>
                    <Button type="button" style={{ color: '#256029', backgroundColor: '#C8E6C9', borderColor: '#256029', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="DORM" onClick={() => { this.bagStatusEditor(allcustomers, currentcustomers, 'delivered-to-dorm') }}>
                    </Button>
                    <Button type="button" style={{ color: '#474549', backgroundColor: 'lightgrey', borderColor: '#474549', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="NO SERVICE" onClick={() => { this.bagStatusEditor(allcustomers, currentcustomers, 'out-of-service') }}>
                    </Button>
                    <Button type="button" style={{ color: '#C63737', backgroundColor: '#FFCDD2', borderColor: '#C63737', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="MISSING" onClick={() => { this.bagStatusEditor(allcustomers, currentcustomers, 'bag-missing') }}>
                    </Button>

                </div>
                <div>

                </div>
            </div>;
            //loading = {true} loadingIcon = "pi pi-spinner"
            return (
                <div id="elmid">
                    <div className="card">
                        <h1>Rez Ops Bag Tracker</h1>
                        <p>The BagTracker is used to update bag statuses, including location, warnings, or overages of bags each the week.</p>
                        <p>ONLY individuals running operations should be accessing this page.</p>
                        <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true}
                        editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}
                        footer={this.displaySelection(this.state.selectedCustomers)} selection={this.state.selectedCustomers} onSelectionChange={e => this.setState({ selectedCustomers: e.value })}>
                            <Column selectionMode="multiple" style={{ width: '3em' }} />
                            <Column field="id" header="ID" sortable={true} />
                            <Column field="name" header="Name" style={{ maxWidth: 150 }} sortable filter filterPlaceholder="Search by name" />
                            <Column field="reshall" header="Residential Hall" sortable={true}/>
                            <Column field="laundrystatus" header="Bag Status" style={{ maxWidth: 150 }} sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate}/>
                            <Column field="weightstatus" header="Weight Status" style={{ maxWidth: 150 }} sortable={true} body={this.weightBodyTemplate}/>
                            <Column field="weekweight" header="Bag Weight" sortable={true} style={{ backgroundColor: '#6a09a4', color: 'white', maxWidth: 100 }} editor={this.generalEditor}/>
                        </DataTable>
                    </div>
                </div>
            );
            /* ---------------- NOT edit mode ------------*/
        } else {
            var header = <div style={{ textAlign: 'left' }}>
                <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
                </Button>
                <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-pencil" iconPos="left" label="EDIT" onClick={this.edit}>
                </Button>
            </div>;
            return (

                <div id="elmid">
                    <div className="card">
                        <h1>Rez Ops Bag Tracker</h1>
                        <p>The BagTracker is used to update bag statuses, including location, warnings, or overages of bags each the week.</p>
                        <p>ONLY individuals running operations should be accessing this page.</p>
                        <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}>
                            <Column field="id" header="ID" sortable={true} />
                            <Column field="name" header="Name" style={{ maxWidth: 150 }} sortable filter filterPlaceholder="Search by name" />
                            <Column field="reshall" header="Residential Hall" sortable={true} />
                            <Column field="laundrystatus" header="Bag Status" style={{ maxWidth: 150 }} sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                            <Column field="weightstatus" header="Weight Status" style={{ maxWidth: 150 }} sortable={true} body={this.weightBodyTemplate}/>
                            <Column field="activestatus" header="Active Status" style={{ maxWidth: 100 }} body={this.activeBodyTemplate} />
                            <Column field="weekweight" header="Bag Weight" style={{ maxWidth: 100 }} sortable={true} />

                        </DataTable>
                    </div>
                </div>
            );

        }

    }
}
