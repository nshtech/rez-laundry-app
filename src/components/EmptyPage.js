import React, {Component} from 'react';
import {FileUpload} from 'primereact/fileupload';
import {Growl} from 'primereact/growl';
import {ProgressBar} from 'primereact/progressbar';

const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = React.useState(config);

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

const ProductTable = (props) => {
    const { items, requestSort, sortConfig } = useSortableData(props.products);
    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    return (
        <table>
            <caption>Customers</caption>
            <thead>
            <tr>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('name')}
                        className={getClassNamesFor('name')}
                    >
                        Name
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('mwr')}
                        className={getClassNamesFor('mwr')}
                    >
                        Months with Rez
                    </button>
                </th>
                <th>
                    <button
                        type="button"
                        onClick={() => requestSort('status')}
                        className={getClassNamesFor('status')}
                    >
                        Bag Status
                    </button>
                </th>
            </tr>
            </thead>
            <tbody>
            {items.map((item) => (
                <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.mwr}</td>
                    <td>{item.status}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default function App() {
    return (
        <div className="App">
            <ProductTable
                products={[
                    { id: 1, name: 'Chris C', mwr: 4.9, stock: 20 },
                    { id: 2, name: 'Sally P', mwr: 1.9, stock: 32 },
                    { id: 3, name: 'Mark E', mwr: 2.4, stock: 12 },
                    { id: 4, name: 'Harrison L', mwr: 3.9, stock: 9 },
                    { id: 5, name: 'Sophie R', mwr: 0.9, stock: 99 },
                    { id: 6, name: 'Rachel W ', mwr: 2.9, stock: 86 },
                    { id: 7, name: 'Joseph B', mwr: 99, stock: 12 },
                ]}
            />
        </div>
    );
}

export class EmptyPage extends Component {

    render() {
        return (
            <div className="App">
                <ProductTable
                    products={[
                        { id: 1, name: 'Chris C', mwr: 4, status: 0 },
                        { id: 2, name: 'Sally P', mwr: 3, status: 1 },
                        { id: 3, name: 'Mark E', mwr: 6, status: 0 },
                        { id: 4, name: 'Harrison L', mwr: 2, status: 1 },
                        { id: 5, name: 'Sophie R', mwr: 1, status: 2 },
                        { id: 6, name: 'Rachel W ', mwr: 5, status: 2 },
                        { id: 7, name: 'Joseph B', mwr: 0, status: 1 },
                    ]}
                />
            </div>
        );
    }
}