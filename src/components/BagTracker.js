import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext';
import { Growl } from 'primereact/growl';

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
    }
    export() {
        this.dt.exportCSV();
    }

    /* --------------- Editing ---------------- */
    edit() {
        this.setState({ editing: true });
        this.growl.show({ severity: 'info', summary: 'Editing Enabled', detail: 'Save changes before continuing' });
    }

    save() {
        this.setState({ editing: false });
        this.growl.clear();
        // console.log(this.state.selectedCustomers)
        // window.location.reload(false);
    }

    onEditorValueChange(props, value) {
        firebase.database().ref('/customers/' + props.rowData.id + '/' + props.field).set(value)
        let updatedCars = [...props.value];
        updatedCars[props.rowIndex][props.field] = value;
        this.setState({ customers: updatedCars });
        console.log(props)
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

    bagStatusEditor(currentcustomers, newstatus) {
        console.log(currentcustomers)
        if (currentcustomers) {
            var ids = Object.keys(currentcustomers).map(function (key) {
                return currentcustomers[key].id;
            });
            var query = firebase.database().ref("customers").orderByKey();
            query.once("value")
                .then(function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        if (ids.includes(key)){
                            var key = childSnapshot.key;
                            firebase.database().ref('/customers/' + key + '/' + "laundrystatus").set(newstatus)
                        }
                    });
            });
        }
        this.setState({ editing: false });
        this.growl.clear();
        window.location.reload();
    }

    inputTextEditor(props, field) {
        return <InputText type="text" onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
    }

    displaySelection(data) {
        if (this.state.editing && (!data || data.length === 0)) {
            return <div style={{ textAlign: 'left' }}>No Selection</div>;
        }
    }


    /* --------------- Filters ---------------- */
    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g, ' ')}</span>;
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
        try {
            const customerArray = [];
            firebase.database().ref('/customers').on('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    customerArray.push(childSnapshot.toJSON());
                });
            });
            this.setState({ customers: customerArray });
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: true });
        }
    }

    componentWillMount() {
        this.loadInitialState()
    }

    render() {
        const statusFilter = this.renderStatusFilter();
        const currentcustomers = this.state.selectedCustomers;

        /* --------------- RETURN ---------------- */
        /* ---------------- edit mode ------------*/
        if (this.state.loading) {
            return <p>Loading</p>
        }
        else {
            if (this.state.editing) {
                var header = <div style={{ textAlign: 'left' }}>
                    <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
                    </Button>
                    <Button type="button" style={{ color: '#6a09a4', backgroundColor: 'white', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-pencil" iconPos="left" label="EDIT" onClick={this.save}>
                    </Button>
                    <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="PICKED UP" onClick={() => {this.bagStatusEditor(currentcustomers, 'picked-up')}}>
                    </Button>
                    <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="SH" onClick={() => { this.bagStatusEditor(currentcustomers, 'delivered-to-SH') }}>
                    </Button>
                    <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="DORM" onClick={() => { this.bagStatusEditor(currentcustomers, 'delivered-to-dorm') }}>
                    </Button>
                </div>;
                //loading = {true} loadingIcon = "pi pi-spinner"
                return (
                    <div id="elmid">
                        <Growl ref={(el) => this.growl = el} sticky={true} />
                        <div className="card">
                            <h1 style={{ fontSize: '16px' }}>Rez Ops Bag Tracker</h1>
                            <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} 
                            editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}
                            footer={this.displaySelection(this.state.selectedCustomers)} selection={this.state.selectedCustomers} onSelectionChange={e => this.setState({ selectedCustomers: e.value })}>
                                <Column selectionMode="multiple" style={{ width: '3em' }} />
                                <Column field="id" header="ID" sortable={true} />
                                <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                                <Column field="email" header="Edit email" sortable={true}/>
                                <Column field="phone" header="Edit phone" sortable={true}/>
                                <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate}/>
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
                    <Button type="button" style={{ color: '#6a09a4', backgroundColor: 'white', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="PICKED UP">
                    </Button>
                    <Button type="button" style={{ color: '#6a09a4', backgroundColor: 'white', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="SH">
                    </Button>
                    <Button type="button" style={{ color: '#6a09a4', backgroundColor: 'white', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="DORM">
                    </Button>
                </div>;
                return (
                    <div id="elmid">
                        <Growl ref={(el) => this.growl = el} />
                        <div className="card">
                            <h1 style={{ fontSize: '16px' }}>Rez Ops Bag Tracker</h1>
                            <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}>
                                <Column field="id" header="ID" sortable={true} />
                                <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                                <Column field="email" header="Email" sortable={true} />
                                <Column field="phone" header="Phone" sortable={true} />
                                <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                            </DataTable>
                        </div>
                    </div>
                );

            }
        }
    }
}