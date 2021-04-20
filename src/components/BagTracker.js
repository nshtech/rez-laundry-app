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
            selectedReshall: null,
            editing: false,
            loading: true,
            selectedCustomers: null
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.export = this.export.bind(this);
        this.onStatusFilterChange = this.onStatusFilterChange.bind(this);
        this.onReshallFilterChange = this.onReshallFilterChange.bind(this);
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

        console.log(this.state.customers[props.rowIndex])
        // console.log(props.rowIndex)

        //if (value > props.rowData.maxweight) {
        
        //if (value > firebase.database().ref('/customers/'+props.rowData.id+'/maxweight')) {
        console.log('value: ',value);
        console.log('maxweight comparison: ',parseInt(this.state.customers[props.rowIndex].maxweight));
        if (parseFloat(value) > parseFloat(this.state.customers[props.rowIndex].maxweight)) {
            let over = parseFloat(value) - parseFloat(this.state.customers[props.rowIndex].maxweight)
            console.log('marking as overweight.');
            firebase.database().ref('/customers/' + props.rowData.id + '/'+'weightstatus').set('overweight')
            /*let temp = firebase.database().ref('/customers/' + props.rowData.id + '/' + 'quarter-overages')
            temp.once('value', (snapshot) => {
                let total = snapshot.val()+over
                firebase.database().ref('/customers/' + props.rowData.id + '/' + 'quarter-overages').set(total)
            })*/
            let updatedCustomers = this.state.customers;
            updatedCustomers[props.rowIndex][props.field] = value;
            updatedCustomers[props.rowIndex]['weightstatus'] = 'overweight';
            //updatedCustomers[props.rowIndex]['quarter-overages'] += parseFloat(value);
            // this.setState({ customers: updatedCustomers });
            return value
        }
        else {
            console.log('marking as underweight');
            firebase.database().ref('/customers/' + props.rowData.id + '/'+'weightstatus').set('underweight')
            let updatedCustomers = this.state.customers;
            updatedCustomers[props.rowIndex][props.field] = value;
            updatedCustomers[props.rowIndex]['weightstatus'] = 'underweight';
            // this.setState({ customers: updatedCustomers });
            return value
        }
    }

    async onEditorValueChange(props, value) {

        firebase.database().ref('/customers/' + props.rowData.id + '/' + props.field).set(value)
        const db = firebase.database().ref();
        var currWeight = value;
        var currDay = new Date().getDate();
        var currMonth = new Date().getMonth() +1;
        if (currMonth < 10) {
            currMonth = '0'+currMonth
        }
        if (currDay < 10) {
            currDay = '0' + currDay
        }
        var currYear = new Date().getFullYear();
        var currDate = currYear + '-' + currMonth + '-'+currDay;
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
        firebase.database().ref('/customers/' + props.rowData.id + '/last_weight_updated').set(currDate + ' ' + currTime)
        const curr = await this.updateWeightStatus(props,value, currDate);
    }

    inputTextEditor(props, field) {
        return <InputText type="text" value={props.rowData[field]} style={{ maxWidth: 100 }} onChange={(e) => { this.onEditorValueChange(props, e.target.value);}}/>
    }

    generalEditor(props) {
        return this.inputTextEditor(props, ' ');
    }

    // onRowEditInit(event) {
    //     this.clonedCars[event.data.vin] = { ...event.data };
    // }

    // onRowEditSave(event) {
    //     if (this.onRowEditorValidator(event.data)) {
    //         delete this.clonedCars[event.data.vin];
    //         this.growl.show({ severity: 'success', summary: 'Success', detail: 'Car is updated' });
    //     }
    //     else {
    //         this.growl.show({ severity: 'error', summary: 'Error', detail: 'Brand is required' });
    //     }
    // }

    // onRowEditCancel(event) {
    //     let cars = [...this.state.cars2];
    //     cars[event.index] = this.clonedCars[event.data.vin];
    //     delete this.clonedCars[event.data.vin];
    //     this.setState({
    //         cars2: cars
    //     })
    // }

    bagStatusEditor(allcustomers, currentcustomers, newstatus) {
        let updatedCustomers = [...allcustomers];
        const db = firebase.database().ref()
        var currDay = new Date().getDate();
        var currMonth = new Date().getMonth() +1;
        if (currMonth < 10) {
            currMonth = '0'+currMonth
        }
        if (currDay < 10) {
            currDay = '0' + currDay
        }
        var currYear = new Date().getFullYear();
        var currDate = currYear + '-' + currMonth + '-'+currDay;
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
                    firebase.database().ref('/customers/' + each.id + '/last_status_updated').set(currDate + ' ' + currTime)

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
        console.log('bagStatusEditor currentcustomers: ',currentcustomers);
        this.dothisfirst(currentcustomers, newstatus)

    }


    dothisfirst(currentcustomers, newstatus) {
        console.log('currentcustomers: ',currentcustomers);
        console.log('newstatus: ',newstatus);
        if (currentcustomers) {
            var ids = Object.keys(currentcustomers).map(function (key) {
                return currentcustomers[key].id;
            });
            console.log('ids: ',ids);
            var query = firebase.database().ref("customers").orderByKey();
            query.once("value")
                .then(function (snapshot) {
                    var counter=0;
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        if (ids.includes(key)) {
                            var key = childSnapshot.key;
                            firebase.database().ref('/customers/' + key + '/' + "laundrystatus").set(newstatus);
                            console.log('currentcustomers in forEach: ',currentcustomers);
                            if (newstatus === 'delivered-to-SH' && parseFloat(currentcustomers[counter].weekweight) > parseFloat(currentcustomers[counter].maxweight)) {
                                firebase.database().ref('/customers/' + key + '/' + "quarter_overages").transaction(function(currOverages) {
                                    //return currOverages+1;
                                    return currOverages + parseFloat(currentcustomers[counter].weekweight) - parseFloat(currentcustomers[counter].maxweight);
                                });
                            }
                            counter = counter+1;

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

//dropdown for laundrystats
    statusBodyTemplate(rowData) {
        var laundryStatusDisplay = {
            'picked-up': 'picked up',
            'delivered-to-SH': 'delivered to SH',
            'delivered-to-dorm': 'delivered to dorm',
            'out-of-service': 'out of service',
            'bag-missing': 'bag missing',
            'start-of-quarter': 'start of quarter'
        }
        return <span className={rowData.laundrystatus}>{laundryStatusDisplay[rowData.laundrystatus]}</span>
    }


    renderStatusFilter() {
        var statuses = [
            { label: 'Picked Up', value: 'picked-up' },
            { label: 'Out of Service', value: 'out-of-service' },
            { label: 'Delivered to SH', value: 'delivered-to-SH' },
            { label: 'Delivered to Dorm', value: 'delivered-to-dorm' },
            { label: 'Bag Missing', value: 'bag-missing' },
            { label: 'Start of Quarter', value: 'start-of-quarter' }
        ];

        return (

            <Dropdown value={this.state.selectedStatus} options={statuses} onChange={this.onStatusFilterChange}
             showClear={true} placeholder="Select a Status" className="p-column-filter" style={{maxWidth: 200, minWidth: 50}} />
        );
    }

    weightBodyTemplate(rowData) {
        return <span className={rowData.weightstatus}>{rowData.weightstatus}</span>;
    }


    onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({ selectedStatus: event.value });
    }


//dropdown for reshall

    reshallBodyTemplate(rowData) {
        var reshallDisplay = {
          '560 Lincoln': '560 Lincoln',
          '720 Emerson': '720 Emerson',
            '1715 Chicago Ave': '1715 Chicago Ave',
          '1838 Chicago': '1838 Chicago',
          '1856 Orrington': '1856 Orrington',
          '2303 Sheridan': '2303 Sheridan',
          'Ayers': 'Ayers',
          'Allison': 'Allison',
          'Bobb': 'Bobb',
          'Chapin': 'Chapin',
          'East Fairchild': 'East Fairchild',
          'Elder': 'Elder',
          'West Fairchild': 'West Fairchild',
          'Foster-Walker': 'Foster-Walker',
          'Goodrich': 'Goodrich',
          'Hobart': 'Hobart',
          'Jones': 'Jones',
          'Kemper': 'Kemper',
          'McCulloch': 'McCulloch',
          'PARC': 'PARC (North Mid Quads)',
          'Rogers House': 'Rogers House',
          'Sargent': 'Sargent',
          'SMQ': 'Shepard Residential College (South Mid Quads)',
          'Shepard': 'Shepard',
          'Slivka': 'Slivka',
          'Willard':  'Willard',
          'Delta Gamma': 'Delta Gamma',
          'Kappa Kappa Gamma': 'Kappa Kappa Gamma',
          'Foster-Walker': 'Foster-Walker',
            'Zeta Beta Tau (ZBT)': 'Zeta Beta Tau (ZBT)'
          }
          return <span className={rowData.reshall}>{reshallDisplay[rowData.reshall]}</span>
    }

    renderReshallFilter() {
        var reshalls = [
            { label: '560 Lincoln', value: '560 Lincoln' },
            { label: '720 Emerson', value: '720 Emerson'},
            { label: '1715 Chicago', value: '1715 Chicago'},
            { label: '1838 Chicago', value: '1838 Chicago'},
            { label: '1856 Orrington', value: '1856 Orrington'},
            { label: '2303 Sheridan', value: '2303 Sheridan'},
            { label: 'Ayers', value: 'Ayers'},
            { label: 'Allison', value: 'Allison'},
            { label: 'Bobb', value: 'Bobb' },
            { label: 'Chapin', value: 'Chapin'},
            { label: 'East Fairchild', value: 'East Fairchild'},
            { label: 'Elder', value: 'Elder'},
            { label: 'West Fairchild', value: 'West Fairchild'},
            { label: 'Foster-Walker', value: 'Foster-Walker'},
            { label: 'Goodrich', value: 'Goodrich'},
            { label: 'Hobart', value: 'Hobart'},
            { label: 'Jones', value: 'Jones' },
            { label: 'Kemper', value: 'Kemper'},
            { label: 'McCulloch', value: 'McCulloch'},
            { label: 'PARC (North Mid Quads)', value: 'PARC'},
            { label: 'Rogers House', value: 'Rogers House' },
            { label: 'Sargent', value: 'Sargent'},
            { label: 'Shepard Residential College (South Mid Quads)', value: 'SMQ'},
            { label: 'Shepard', value: 'Shepard'},
            { label: 'Slivka', value: 'Slivka'},
            { label: 'Willard', value: 'Willard'},
            { label: 'Delta Gamma', value: 'Delta Gamma'},
            { label: 'Kappa Kappa Gamma', value: 'Kappa Kappa Gamma'},
            { label: 'Foster-Walker', value: 'Foster-Walker'},
            { label: 'Zeta Beta Tau (ZBT)', value: 'Zeta Beta Tau (ZBT)'}
    ];

        return (

            <Dropdown value={this.state.selectedReshall} options={reshalls} onChange={this.onReshallFilterChange}
             showClear={true} placeholder="Select a Dorm" className="p-column-filter" style={{maxWidth: 200, minWidth: 50}} />
        );
    }


    onReshallFilterChange(event) {
        this.dt.filter(event.value, 'reshall', 'equals');
        this.setState({ selectedReshall: event.value });
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
        const reshallFilter = this.renderReshallFilter();
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
                    <Button type="button" style={{ color: '#474549', backgroundColor: 'lightgrey', borderColor: '#474549', marginRight: 10 }} icon="pi pi-check" iconPos="left" label="START" onClick={() => { this.bagStatusEditor(allcustomers, currentcustomers, 'start-of-quarter') }}>
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
                            <Column field="reshall" header="Residential Hall" style={{ maxWidth: 200 }} sortable={true} filter filterElement={reshallFilter} body={this.reshallBodyTemplate}/>
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
                            <Column field="reshall" header="Residential Hall" style={{ maxWidth: 200 }} sortable={true} filter filterElement={reshallFilter} body={this.reshallBodyTemplate}/>
                            <Column field="laundrystatus" header="Bag Status" style={{ maxWidth: 150 }} sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                            <Column field="weightstatus" header="Weight Status" style={{ maxWidth: 150 }} sortable={true} body={this.weightBodyTemplate}/>
                            <Column field="weekweight" header="Bag Weight" style={{ maxWidth: 100 }} sortable={true} />

                        </DataTable>
                    </div>
                </div>
            );

        }

    }
}
