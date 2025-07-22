import React, { memo } from 'react';
import './TagFilter.module.css';

const TagFilter = ({ allTags, selectedTags, onTagChange }) => {

  const handleTagClick = (tag) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagChange(newSelectedTags);
  };
  const handleClearTags = () => {
    onTagChange([]);
  };

  return (
    <div className="tag-filter-container">
      <div className="tag-header">
        <p className="tag-filter-label">🏷️ სპეციალობის მიხედვით ფილტრი</p>
        {selectedTags.length > 0 && (
          <button className="clear-tags-button" onClick={handleClearTags}>
            ყველას წაშლა
          </button>
        )}
      </div>
      <div className="tag-pills-container">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(TagFilter);