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
            selectedStatus: null,
            editing: false,
            loading: true,
            selectedCustomers: null
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.export = this.export.bind(this);
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
        window.location.reload();
        // console.log(this.state.selectedCustomers)
        // window.location.reload(false);
    }


    updateWeightStatus(props,value) {
        if (props.rowData.weeklyweight > props.rowData.maxweight) {
            firebase.database().ref('/customers/' + props.rowData.id + '/'+'weightstatus').set('overweight')
            return value
        }
        else {
            firebase.database().ref('/customers/' + props.rowData.id + '/'+'weightstatus').set('underweight')
            return value
        }
    }

    async onEditorValueChange(props, value) {
        firebase.database().ref('/customers/' + props.rowData.id + '/' + props.field).set(value)
        let updatedCars = [...props.value];
        updatedCars[props.rowIndex][props.field] = value;
        this.setState({ customers: updatedCars });

        const curr = await this.updateWeightStatus(props,value);
        console.log('row data: ');
        console.log(props.rowData);
        updatedCars[props.rowIndex]['weightstatus'] = props.rowData.weightstatus;
        this.setState({ customers: updatedCars });
        console.log(props)
        // this.setState({ editing: false });
        // window.location.reload(); 
    }



    inputTextEditor(props, field) {
        return <InputText type="text" onChange={(e) => {this.onEditorValueChange(props, e.target.value);}}/>
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

    async bagStatusEditor(currentcustomers, newstatus) {
        const curr = await this.dothisfirst(currentcustomers, newstatus)
        console.log(curr)
        this.setState({ editing: false });
        window.location.reload();
    }


    dothisfirst(currentcustomers, newstatus) {
        // console.log(currentcustomers)
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
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g,' ')}</span>
    }
    weightBodyTemplate(rowData) {
        return <span className={rowData.weightstatus}>{rowData.weightstatus}</span>;
    }

    /*weeklyWeightTemplate(rowData) {
        const dates = Object.keys(rowData.weeklyweight);
        console.log(dates);
        const recentDate = Math.max(dates);
        return <span> {rowData.weeklyweight.recentDate}</span>;
    } */

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
                showClear={true} placeholder="Select a Status" className="p-column-filter" />
        );
    }

    onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({ selectedStatus: event.value });
    }

    // componentDidMount() {
    //     const customerArray = [];
    //     firebase.database().ref('/customers').on('value', function (snapshot) {
    //         snapshot.forEach(function (childSnapshot) {
    //             customerArray.push(childSnapshot.toJSON());
    //         });
    //     });
    //     this.setState({ customers: customerArray });
    // }

    loadInitialState = async () => {
        const customerArray = [];
        firebase.database().ref('/customers').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
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
                    <Button type="button" style={{ color: '#23547B', backgroundColor: '#B3E5FC', borderColor: '#23547B', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="PICKED UP" onClick={() => {this.bagStatusEditor(currentcustomers, 'picked-up')}}>
                    </Button>
                    <Button type="button" style={{ color: '#694382', backgroundColor: '#ECCFFF', borderColor: '#694382', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="SH" onClick={() => { this.bagStatusEditor(currentcustomers, 'delivered-to-SH') }}>
                    </Button>
                    <Button type="button" style={{ color: '#256029', backgroundColor: '#C8E6C9', borderColor: '#256029', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="DORM" onClick={() => { this.bagStatusEditor(currentcustomers, 'delivered-to-dorm') }}>
                    </Button>
                    <Button type="button" style={{ color: '#474549', backgroundColor: 'lightgrey', borderColor: '#474549', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="NO SERVICE" onClick={() => { this.bagStatusEditor(currentcustomers, 'out-of-service') }}>
                    </Button>
                    <Button type="button" style={{ color: '#C63737', backgroundColor: '#FFCDD2', borderColor: '#C63737', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="MISSING" onClick={() => { this.bagStatusEditor(currentcustomers, 'bag-missing') }}>
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
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                            <Column field="reshall" header="Residential Hall" sortable={true}/>
                            <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate}/>
                            <Column field="weightstatus" header="Weight Status" sortable={true} body={this.weightBodyTemplate}/>
                            <Column field="weeklyweight" header="Bag Weight" sortable={true} editor={this.generalEditor}/>

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
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                            <Column field="reshall" header="Residential Hall" sortable={true} />
                            <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                            <Column field="weightstatus" header="Weight Status" sortable={true} body={this.weightBodyTemplate}/>
                            <Column field="weeklyweight" header="Bag Weight" sortable={true}/>
                        </DataTable>
                    </div>
                </div>
            );

        }

    }
}

//<Column field="weeklyweight" header="Bag Weight" sortable={true} editor={this.generalEditor}/>