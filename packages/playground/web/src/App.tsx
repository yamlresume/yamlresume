import { Playground } from '@yamlresume/playground'
import { getSampleResume } from '@yamlresume/samples'
import { useState } from 'react'

export default function App() {
  const [resume, setResume] = useState(
    getSampleResume('software-engineer', 'en', {
      withComments: true,
      withLayouts: true,
    })
  )

  return (
    <div className="h-screen w-screen">
      <Playground yaml={resume} onChange={setResume} />
    </div>
  )
}
