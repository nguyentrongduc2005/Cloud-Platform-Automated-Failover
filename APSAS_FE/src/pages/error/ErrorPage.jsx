import React from 'react'
import { useNavigate } from 'react-router-dom'

const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='max-w-md w-full text-center space-y-6'>
        <div className='space-y-4'>
          <div className='text-6xl font-bold text-primary'>404</div>
          <h2 className='text-3xl font-semibold text-foreground'>Whoops!</h2>
          <h3 className='text-xl font-medium text-foreground'>Something went wrong</h3>
          <p className='text-muted-foreground'>
            The page you&apos;re looking for isn&apos;t found, we suggest you back to home.
          </p>
        </div>
        
        <div className='space-y-3'>
          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full'
          >
            Back to home page
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full text-primary'
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage