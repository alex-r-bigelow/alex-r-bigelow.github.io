/* globals d3, uki */

class ProjectFeed extends uki.View {
  constructor (options = {}) {
    options.resources = options.resources || [];
    options.resources.push(...[
      { type: 'less', url: 'views/ProjectFeed/style.less' },
      { type: 'text', url: 'views/ProjectFeed/template.html' }
    ]);
    super(options);
  }

  async setup () {
    await super.setup(...arguments);

    this.d3el.html(this.getNamedResource('template'));

    const self = this;
    self.youtubeVideos = {};
    this.d3el.selectAll('.youtubePlaceholder').each(function () {
      const youTubeID = this.dataset.youtubeid;
      self.youtubeVideos[youTubeID] = {};

      const placeholder = d3.select(this);
      // Fill in placeholders with high-res images
      placeholder.attr('src', `http://i.ytimg.com/vi/${youTubeID}/default.jpg`);
      // Create an (initially hidden) iframe and load the video
      const iframe = self.d3el.insert('iframe', `[data-youTubeID="${youTubeID}"]`)
        .style('display', 'none')
        .attr('frameborder', '0')
        .attr('allowfullscreen', '')
        .attr('src', `https://www.youtube.com/embed/${youTubeID}`);
      // The placeholder will be sized appropriately once the image
      // loads; borrow those dimensions, minus the padding
      placeholder.on('load', () => {
        self.youtubeVideos[youTubeID].placeholder = placeholder;
      });
      // When the video finally loads, swap it
      iframe.on('load', () => {
        self.youtubeVideos[youTubeID].iframe = iframe;
        placeholder.style('display', 'none')
          .style('padding', 0);
        iframe.style('display', null);
        self.render();
      });
    });
  }

  async draw () {
    await super.draw(...arguments);

    for (const { placeholder, iframe } of Object.values(this.youtubeVideos)) {
      if (placeholder && iframe) {
        placeholder.style('display', null);
        const bounds = placeholder.node().getBoundingClientRect();
        placeholder.style('display', 'none');
        iframe
          .attr('width', bounds.width + 'px')
          .attr('height', bounds.height + 'px');
      }
    }
  }
}

export default ProjectFeed;