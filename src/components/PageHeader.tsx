export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex justify-center mt-4 mb-6">
      <span
        className="inline-block px-6 py-2 rounded-full text-lg font-semibold pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #DBEAFE, #EEF2FF)',
          color: '#534AB7',
          border: '1px solid #C7D2FE',
        }}
      >
        {title}
      </span>
    </div>
  )
}
