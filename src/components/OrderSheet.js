import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext';
import { Growl } from 'primereact/growl';

import firebase from 'firebase/app';
import 'firebase/database';

// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class OrderSheet extends Component {

    constructor() {
        super();
        this.state = {
            customers: [],
            selectedStatus: null,
            editing: false
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.export = this.export.bind(this);
        this.onStatusFilterChange = this.onStatusFilterChange.bind(this);

        this.generalEditor = this.generalEditor.bind(this);
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
    }

    onEditorValueChange(props, value) {
        firebase.database().ref('/customers/' + props.rowData.id + '/' + props.field).set(value)
        let updatedCustomers = [...props.value];
        updatedCustomers[props.rowIndex][props.field] = value;
        this.setState({ customers: updatedCustomers });
        console.log(props)
    }

    inputTextEditor(props, field) {
        return <InputText type="text" value={props.rowData[field]} onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
    }

    generalEditor(props) {
        return this.inputTextEditor(props, ' ');
    }

    phoneValidator(props) {
        let value = props.rowData[props.field]
        return value[3] === '-' && value.length === 12;
    }
    emailValidator(props) {
        let value = props.rowData[props.field]
        return value && value.length > 0;
    }

    /* --------------- Filters ---------------- */
    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g, ' ')}</span>;
    }

    weightBodyTemplate(rowData) {
        return <span className={rowData.weightstatus}>{rowData.weightstatus}</span>;
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
                showClear={true} placeholder="Select a Status" className="p-column-filter" style={{ maxWidth: 200, minWidth: 50 }} />
        );
    }

    onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({ selectedStatus: event.value });
    }

    componentDidMount() {
        const customerArray = [];
        firebase.database().ref('/customers').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
            });
            console.log(customerArray)
            console.log(customerArray[0])
        });
        this.setState({ customers: customerArray });
    }

    render() {
        const statusFilter = this.renderStatusFilter();

        /* --------------- RETURN ---------------- */
        /* ---------------- edit mode ------------*/
        var header = <div style={{ textAlign: 'left' }}>
        </div>;
        return (
            <div>
                <Growl ref={(el) => this.growl = el} />
                <div className="card">
                    <h1>Order Database</h1>
                    <p>All members of the RezLaundry team should have read and write access to this database.</p>
                    <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}>
                        <Column field="id" header="ID" sortable={true} />
                        <Column field="name" header="Name" style={{ maxWidth: 150 }} sortable filter filterPlaceholder="Search by name" />
                        <Column field="email" header="Email" sortable={true} />
                        <Column field="phone" header="Phone" sortable={true} />
                        <Column field="laundrystatus" header="Bag Status" style={{ maxWidth: 150 }} sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                        <Column field="weightstatus" header="Weight Status" style={{ maxWidth: 150 }} sortable={true} body={this.weightBodyTemplate} />
                    </DataTable>
                </div>
            </div>
        )

    }
}