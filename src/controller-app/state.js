import moment from 'moment'

const CHANGE_BLUR = 'CHANGE_BLUR'
const UPDATE_BUS_LOCATION = 'UPDATE_BUS_LOCATION'
const UPDATE_INBOUND = 'UPDATE_INBOUND'
const UPDATE_OUTBOUND = 'UPDATE_OUTBOUND'
const UPDATE_ACTIVE = 'UPDATE_ACTIVE'
const UPDATE_OPERATOR_ID = 'UPDATE_OPERATOR_ID'
const ADD_BUS_TO_HISTORY = 'ADD_BUS_TO_HISTORY'

export const changeBlur = (payload) => ({ type: CHANGE_BLUR, payload })
export const updateBusLocation = (payload) => ({ type: UPDATE_BUS_LOCATION, payload })
export const updateInbound = (payload) => ({ type: UPDATE_INBOUND, payload })
export const updateOutbound = (payload) => ({ type: UPDATE_OUTBOUND, payload })
export const changeActive = (payload) => ({ type: UPDATE_ACTIVE, payload })
export const updateOperatorId = (payload) => ({ type: UPDATE_OPERATOR_ID, payload })
export const addBusToHistory = (payload) => ({ type: ADD_BUS_TO_HISTORY, payload })

const initalState = {
    blur: false,
    busses: [],
    inbound: [],
    outbound: [],
    active: 'santa_fe',
    operator_id: '',
    past_buses: [],
    last_change: moment().format('HH:mm a')
};

export default (state = initalState, action) => {
    switch (action.type) {
        case CHANGE_BLUR:
        return {...state, blur: action.payload}
        case UPDATE_BUS_LOCATION:
        return {...state, busses: action.payload, last_change: moment().format('HH:mm a')}
        case UPDATE_INBOUND:
        return {...state, inbound: action.payload}
        case UPDATE_OUTBOUND:
        return {...state, outbound: action.payload}
        case UPDATE_ACTIVE:
        return {...state, active: action.payload}
        case UPDATE_OPERATOR_ID:
        return {...state, operator_id: action.payload}
        case ADD_BUS_TO_HISTORY:
        return {...state, past_buses: state.past_buses.concat(action.payload)}
        default:
        return state;
    }
    
}