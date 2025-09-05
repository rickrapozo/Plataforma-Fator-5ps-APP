import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Star } from 'lucide-react'

const LibraryPage: React.FC = () => {
  const books = [
    {
      id: 'mindset-transformation',
      title: 'Transformação Mental Completa',
      author: 'Dr. Essential Factor',
      description: 'Guia completo para reprogramação mental usando o método 5P',
      pages: 250,
      readTime: '4h 30min',
      rating: 4.9,
      cover: '📚',
      category: 'Desenvolvimento Pessoal'
    },
    {
      id: 'prosperity-mindset',
      title: 'Mentalidade da Prosperidade',
      author: 'Prof. Abundância',
      description: 'Como desenvolver uma relação saudável com o dinheiro e a abundância',
      pages: 180,
      readTime: '3h 15min',
      rating: 4.8,
      cover: '💎',
      category: 'Finanças Pessoais'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-white text-3xl font-heading font-bold mb-4">
          Biblioteca Digital
        </h1>
        <p className="text-pearl-white/80 text-body-lg">
          Conhecimento transformador ao seu alcance
        </p>
      </motion.div>

      <div className="space-y-6">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex space-x-4">
              {/* Book Cover */}
              <div className="w-20 h-28 bg-gradient-to-br from-royal-gold to-bright-gold rounded-lg flex items-center justify-center text-3xl shadow-lg">
                {book.cover}
              </div>

              {/* Book Info */}
              <div className="flex-1">
                <h3 className="text-white font-heading font-bold text-xl mb-2">
                  {book.title}
                </h3>
                <p className="text-royal-gold font-medium text-sm mb-2">
                  por {book.author}
                </p>
                <p className="text-pearl-white/80 text-body-md mb-4">
                  {book.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-pearl-white/70 mb-4">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{book.pages} páginas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{book.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-royal-gold" />
                    <span>{book.rating}</span>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 bg-sage-green/30 text-sage-green text-xs rounded-full">
                  {book.category}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                className="w-full bg-gradient-to-r from-royal-gold to-bright-gold text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                whileTap={{ scale: 0.98 }}
              >
                Começar leitura
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default LibraryPage