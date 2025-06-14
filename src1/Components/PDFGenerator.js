import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Alert } from 'react-native';

export const generatePDF = async (users = []) => {
  try {
    if (!Array.isArray(users) || users.length === 0) {
      Alert.alert('Error', 'No user data available for the report.');
      return;
    }

    let userTableRows = users.map(
      (user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${user.name}</td>
        <td>₹${user.rate}/hour</td>
        <td>${user.machines?.length || 0}</td>
        <td>₹${user.machines?.reduce((acc, m) => acc + (m.cost || 0), 0).toFixed(2)}</td>
      </tr>`
    ).join('');

    let htmlContent = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>User Report</h2>
          <table>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Rate</th>
              <th>Machines Used</th>
              <th>Total Cost</th>
            </tr>
            ${userTableRows}
          </table>
        </body>
      </html>
    `;

    let options = {
      html: htmlContent,
      fileName: 'User_Report',
      directory: 'Documents',
    };

    let file = await RNHTMLtoPDF.convert(options);
    Alert.alert('PDF Generated', `Saved at: ${decodeURIComponent(file.filePath)}`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    Alert.alert('Error', 'Failed to generate PDF.');
  }
};
