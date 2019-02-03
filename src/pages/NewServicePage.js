import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import NewServiceStepper from '../components/NewServiceComponents/NewServiceStepper'
import ServiceDetails from '../components/NewServiceComponents/Service/ServiceDetails'
import ServiceDetailsComplete from '../components/NewServiceComponents/Service/ServiceDetailsComplete'
import ConfigContainer from '../components/NewServiceComponents/config/ConfigContainer'
import FinishConfigList from '../components/NewServiceComponents/config/FinishConfigList'
import CompleteStep from '../components/NewServiceComponents/CompleteStep'
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom'
import queryString from 'query-string';
import LoadingError from "../components/Common/LoadingError";
import Loading from '../components/Common/Loading';

const styles = theme => ({
    root: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: "90%",
        margin: '0 auto'
    }
})
const STEPS = {
    serviceDetails: 0,
    configDetails: 1,
    completeStep: 2
}

const ADD_SERVICE = gql`
mutation AddService($service:InputService!){
  newService(service:$service){
    success,
    error
  }
}
`

const GET_SERVICES = gql`
{
  service  {
    id
    name
    description 
    environments {
      name
    }
  }
}`

class NewServicePage extends React.Component {
    constructor(pros) {
        super(pros)
        this.serviceId = queryString.parse(this.props.location.search).serviceId || null
    }
    state = {
        service: {},
        serviceComplete: false,
        currentConfig: {},
        configs: [],
        step: STEPS.serviceDetails,
    }
    editConfig = (key) => {
        this.setState(p => ({
            editedID: key,
            currentConfig: p.configs[key],
            step: STEPS.configDetails
        }))
    }
    handleAddService = (service) => {
        this.setState({ service, serviceComplete: true, step: STEPS.configDetails })
    }
    reEditService = () => {
        this.setState({ serviceComplete: false, step: STEPS.serviceDetails })
    }
    addConfigCallback = (config) => {
        this.setState(p => {
            const configs = p.configs
            if (p.editedID !== undefined)
                configs[p.editedID] = config
            else
                configs.push(config)
            return { configs, currentConfig: {}, step: STEPS.completeStep, editedID: undefined }
        })
    }
    cancelConfigEdit = () => {
        return { currentConfig: {}, step: STEPS.completeStep, editedID: undefined }
    }
    addEnvironment = () => {
        console.log(JSON.stringify(this.state, 0, 4))
        this.setState({
            step: STEPS.configDetails
        })
    }
    getConfigs = () => {
        return {
            environments: this.state.configs.map(i => ({
                name: i.name,
                config: {
                    data: JSON.stringify(i.configFile)
                }
            }))
        }
    }
    mutationRendering = (data, error) => {
        if (data) {
            toast.success("service added")
            this.props.history.push('/')
        }
        if (error) {
            toast.error("failed adding config")
            console.log(error)
        }
    }
    getService = (serviceId, services) => {
        let service = services.service.find(s => s.id === serviceId)
        const newState = {
            service: {
                name: service.name,
                description: service.description
            },
            serviceComplete: true,
            configs: service.environments.map(env => {
                return { name: env['name'] };
            }),
            step: STEPS.completeStep
        };

        this.serviceId = null
        this.setState(newState)
        
    }

    render() {
        const { step, service, currentConfig, configs, editedID } = this.state
        const { classes } = this.props
        return (<div className={classes.root}>
            <Query query={GET_SERVICES}>
                {({ loading, error, data }) => {
                    if (loading) return <Loading />
                    if (error) return (<Typography className={classes.title} variant="h6" color="inherit" noWrap>
                        <LoadingError />
                    </Typography>)
                    if(this.serviceId) {
                        this.getService(this.serviceId, data);
                    }
                    return(
                        <Grid container spacing={24}>
                            <Grid item xs={12} sm={3}>
                                {this.state.serviceComplete ?
                                    <React.Fragment>
                                        <ServiceDetailsComplete service={service} editService={this.reEditService} />
                                        {configs && configs.length !== 0 &&
                                            <FinishConfigList configs={configs} editConfig={this.editConfig} isUpdate={step !== STEPS.configDetails} />
                                        }
                                    </React.Fragment> :
                                    <ServiceDetails service={service} addServiceCallback={this.handleAddService} />

                                }
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                {step === STEPS.configDetails && <ConfigContainer editedID={editedID}
                                    cancel={this.props.cancelConfigEdit} cancelable={configs.length !== 0}
                                    config={currentConfig} addConfigCallback={this.addConfigCallback} />}
                                {step === STEPS.completeStep &&
                                    <Mutation mutation={ADD_SERVICE}>
                                        {(addService, { data, error }) => {
                                            this.mutationRendering(data, error)
                                            return (
                                                <CompleteStep addEnvironment={this.addEnvironment}
                                                    complete={() => {
                                                        const variables = { service: Object.assign({}, service, this.getConfigs()) }
                                                        addService({ variables })
                                                    }} />
                                            )
                                        }}
                                    </Mutation>}
                            </Grid>
                        </Grid>
                    )
                }}
            </Query>
            <NewServiceStepper step={this.state.step} />
        </div>)
    }
}

export default withRouter(withStyles(styles)(NewServicePage));
