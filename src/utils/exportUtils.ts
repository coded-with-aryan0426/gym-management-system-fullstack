export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        return;
    }

    // specific to transactions
    const headers = ['id', 'date', 'description', 'category', 'amount', 'type', 'status'];

    // Convert data to CSV string
    const csvContent = [
        headers.join(','),
        ...data.map(item => headers.map(header => {
            let value = item[header];
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        }).join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
