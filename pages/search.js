
import React from 'react'

export default function SearchPage() {
	return (
		<main style={{padding: '2rem'}}>
			<h1>Search</h1>
			<p>Use this page to search worksheets (placeholder).</p>
			<input
				type="search"
				placeholder="Search worksheets..."
				style={{padding: '0.5rem', width: '100%', maxWidth: 480}}
			/>
		</main>
	)
}
