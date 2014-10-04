/** @jsx React.DOM */

var converter = new Showdown.converter();

var Project = React.createClass({
  render: function() {
    var rawMarkup = converter.makeHtml(this.props.children.toString());
    return (
      <div className="project">
        <h2 className="project_name">
          {this.props.name}
        </h2>
        <h3 className="project_owner">
          {this.props.owner}
        </h3>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

var ProjectBox = React.createClass({
  loadProjectsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleProjectSubmit: function(project) {
    var projects = this.state.data;
    projects.push(project);
    this.setState({data: projects}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: project,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadProjectsFromServer();
    setInterval(this.loadProjectsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="projectBox">
        <h1>Projects</h1>
        <ProjectList data={this.state.data} />
        <ProjectForm onProjectSubmit={this.handleProjectSubmit} />
      </div>
    );
  }
});

var ProjectList = React.createClass({
  render: function() {
    var ProjectNodes = this.props.data.map(function(project, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <Project owner={project.owner} key={index}>
          {project.description}
        </Project>
      );
    });
    return (
      <div className="projectList">
        {ProjectNodes}
      </div>
    );
  }
});

var ProjectForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var owner = this.refs.owner.getDOMNode().value.trim();
    var name = this.refs.name.getDOMNode().value.trim();
    var description = this.refs.description.getDOMNode().value.trim();
    if (!name || !owner) {
      return;
    }
    this.props.onProjectSubmit({owner: owner, name: name, description: description});
    this.refs.owner.getDOMNode().value = '';
    this.refs.name.getDOMNode().value = '';
    this.refs.description.getDOMNode().value = '';
    return;
  },
  render: function() {
    return (
      <form className="projectForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Owner's name" ref="owner" size="30" />
        <input type="text" placeholder="Project Name" ref="name" size="30" />
        <br />
        <input type="text" placeholder="Project Description (can use Markdown)" ref="description" size="60" />
        <br />
        <input type="submit" value="Save" />
      </form>
    );
  }
});

React.renderComponent(
  <ProjectBox url="projects.json" pollInterval={2000} />,
  document.getElementById('content')
);
