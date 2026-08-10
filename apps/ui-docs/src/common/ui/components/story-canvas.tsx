export type StoryCanvasProps = {
  children: React.ReactNode
}

export const StoryCanvas: React.FC<StoryCanvasProps> = ({ children }) => {
  return <div className="p-6 flex items-center justify-center">{children}</div>
}
