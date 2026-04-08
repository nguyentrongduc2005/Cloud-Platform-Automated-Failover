import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #374151 #0f1419;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #0f1419;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: #0f1419;
  }
`;

export default function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  className = "" 
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // selectedLanguage is an object with {id, name, version, template}, not just a value
  const currentLang = selectedLanguage ? 
    SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguage.id) : 
    null;

  const handleLanguageSelect = (language) => {
    // Convert SUPPORTED_LANGUAGES format to the format expected by AssignmentDetail
    const selectedLang = {
      id: language.id,
      name: language.name,
      version: language.version,
      template: language.template
    };
    onLanguageChange(selectedLang);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Inject custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
      <div className="flex items-center gap-2">
        {/* Custom Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[#0b0f12] border border-[#202934] rounded text-white text-sm hover:border-emerald-500 focus:outline-none focus:border-emerald-500 transition"
          >
            <span>{selectedLanguage?.name || currentLang?.label || 'Select Language'}</span>
            <ChevronDown 
              size={14} 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0f12] border border-[#202934] rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto custom-scrollbar">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full text-left px-4 py-3 hover:bg-[#202934] transition first:rounded-t-lg last:rounded-b-lg ${
                      selectedLanguage?.id === language.id 
                        ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{language.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {language.version}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Icon với Tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-white transition"
          >
            <Info size={14} />
          </button>

          {showTooltip && (selectedLanguage || currentLang) && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[#0b0f12] border border-[#202934] rounded-lg shadow-lg p-4 z-30">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {selectedLanguage?.name || currentLang?.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {currentLang?.description || `${selectedLanguage?.name} ${selectedLanguage?.version}`}
                  </p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-2">Template Code:</div>
                  <div className="bg-[#0f1419] border border-[#202934] rounded p-2">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre overflow-x-auto custom-scrollbar">
                      {selectedLanguage?.template || currentLang?.template}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Language ID:</span>
                  <span className="text-emerald-400 font-mono">#{selectedLanguage?.id || currentLang?.id}</span>
                </div>
              </div>

              {/* Tooltip Arrow */}
              <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#202934]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

