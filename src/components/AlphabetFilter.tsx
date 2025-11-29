"use client"

interface AlphabetFilterProps {
  onFilter: (letter: string | null) => void
  selectedLetter: string | null
}

export default function AlphabetFilter({ onFilter, selectedLetter }: AlphabetFilterProps) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const getButtonStyle = (isSelected: boolean) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#2563EB' : '#F3F4F6',
    color: isSelected ? 'white' : '#374151'
  })

  const getLetterButtonStyle = (isSelected: boolean) => ({
    width: '2rem',
    height: '2rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#2563EB' : '#F3F4F6',
    color: isSelected ? 'white' : '#374151'
  })

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <button
        onClick={() => onFilter(null)}
        style={getButtonStyle(selectedLetter === null)}
        onMouseEnter={(e) => {
          if (selectedLetter !== null) {
            e.currentTarget.style.backgroundColor = '#E5E7EB'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedLetter !== null) {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
          }
        }}
      >
        All
      </button>
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => onFilter(letter)}
          style={getLetterButtonStyle(selectedLetter === letter)}
          onMouseEnter={(e) => {
            if (selectedLetter !== letter) {
              e.currentTarget.style.backgroundColor = '#E5E7EB'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLetter !== letter) {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }
          }}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}
