(async () => {
  try {
    const res = await fetch('http://localhost:8080/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ResCategory: 'Test', ResName: 'New Resource - description' })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (e) {
    console.error('ERR', e);
  }
})();
