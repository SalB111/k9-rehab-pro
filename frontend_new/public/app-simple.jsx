const { useState } = React;

const App = () => {
  return (
    <div style={{padding: '40px', fontFamily: 'Arial'}}>
      <h1>Simple React Test</h1>
      <p>If you see this, React + Babel are working!</p>
      <p>The issue is in the full app.jsx file.</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
