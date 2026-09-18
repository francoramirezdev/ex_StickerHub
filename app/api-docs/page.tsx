export default function ApiDocs() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 68px - 80px)' }}>
      <iframe 
        src="/swagger.html" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Swagger API Documentation"
      />
    </div>
  )
}
