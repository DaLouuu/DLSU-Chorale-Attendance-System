export function PageFooter() {
  return (
    <footer className="bg-[#1B1B1B] py-4 dark:bg-gray-900 dark:border-t dark:border-gray-800">
      <div className="container mx-auto px-4 text-center text-white text-sm">
        &copy; {new Date().getFullYear()} DLSU Chorale. All rights reserved.
      </div>
    </footer>
  )
}
