import axios from 'axios';

const test = async () => {
  try {
    console.log('Fetching channels from http://localhost:5001/api/channels...');
    const channelsRes = await axios.get('http://localhost:5001/api/channels');
    console.log('Channels Status:', channelsRes.status);
    console.log('Channels Count:', channelsRes.data.length);
    console.log('Channels Sample:', JSON.stringify(channelsRes.data.slice(0, 2), null, 2));
    
    console.log('\nFetching pronos from http://localhost:5001/api/pronos...');
    const pronosRes = await axios.get('http://localhost:5001/api/pronos');
    console.log('Pronos Status:', pronosRes.status);
    console.log('Pronos Count:', pronosRes.data.length);
    console.log('Pronos Sample:', JSON.stringify(pronosRes.data.slice(0, 2), null, 2));
  } catch (err) {
    console.error('Error fetching from API:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
  }
};

test();
