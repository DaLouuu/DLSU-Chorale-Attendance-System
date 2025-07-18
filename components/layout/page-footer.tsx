export function PageFooter() {
  return (
    <footer className="bg-background border-t border-border py-4">
      <div className="container mx-auto px-4 text-center text-foreground text-sm">
        &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
      </div>
    </footer>
  )
}
